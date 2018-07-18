// @flow

import * as React from 'react'
import io from 'socket.io-client'
import Peer from './Peer'
import { observable, decorate } from 'mobx'
import { observer } from 'mobx-react'

const config = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
    {
      urls: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808',
    },
    {
      urls: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808',
    },
  ],
}

const messageTypes = {
  OFFER: 'OFFER',
  ANSWER: 'ANSWER',
  ICE: 'ICE',
}

type IceServer = {
  urls: string,
  credential?: string,
  username?: string,
}

type Props = {
  config?: {
    iceServers: IceServer[],
  },
  url?: string,
  roomName?: string,
  children?: ({ myStream?: ?HTMLSourceElement, remotes?: (?Peer)[] }) => void,
}

type State = {
  myStream: ?HTMLSourceElement,
}

class WebRTCConnection extends React.Component<Props, State> {
  static defaultProps = {
    config,
    url: 'https://nashwanchat.herokuapp.com',
    roomName: 'c304',
  }

  pc: any
  socket: any
  // Observable
  peers: Map<string, Peer> = new Map()
  state = {
    myStream: null,
  }

  componentDidMount() {
    /* Code from https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {}
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        // First get ahold of the legacy getUserMedia, if present
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream =>
        this.setState({ myStream: stream }, () => {
          // Add WebSocket connection
          this.socket = io(this.props.url)
          this.socket.on('connect', () => console.log(`Connected with ID: ${this.socket.id}`))
          this.socket.on('message', this.handleMessage)
          this.socket.on('peer connected', this.handlePeerConnected)
          this.socket.on('peer disconnected', this.handlePeerDisconnected)
          this.socket.emit('join', this.props.roomName)
        }),
      )
      .catch(console.error)
  }

  handleIceCandidate = (candidate: any, peerId: string) => {
    const message = {
      to: peerId,
      type: messageTypes.ICE,
      candidate,
    }
    this.socket.emit('message', message)
  }

  handleMessage = (message: any) => {
    console.log(message)
    let peer = this.peers.get(message.from)
    if (!peer) {
      const { myStream: stream } = this.state
      if (!stream) {
        return
      }
      peer = new Peer({
        config,
        onIceCandidate: this.handleIceCandidate,
        stream,
        peerId: message.from,
      })
      this.peers.set(peer.id, peer)
    }
    switch (message.type) {
      case messageTypes.OFFER: {
        return peer
          .handleOffer(message.offer)
          .then(answer => {
            const response = {
              to: message.from,
              type: messageTypes.ANSWER,
              answer,
            }
            this.socket.emit('message', response)
          })
          .catch(console.error)
      }
      case messageTypes.ANSWER: {
        return peer.handleAnswer(message.answer)
      }
      case messageTypes.ICE: {
        return peer.processIce(message.candidate)
      }
      default: {
        return
      }
    }
  }

  handlePeerConnected = (peerId: string) => {
    console.log(`Peer ${peerId} connected`)
    const { myStream: stream } = this.state
    if (peerId && stream) {
      const peer = new Peer({ config, onIceCandidate: this.handleIceCandidate, stream, peerId })
      this.peers.set(peer.id, peer)
      peer
        .createOffer()
        .then(offer => {
          const message = {
            to: peer.id,
            type: messageTypes.OFFER,
            offer,
          }
          this.socket.emit('message', message)
        })
        .catch(err => console.error(err))
    }
  }

  handlePeerDisconnected = (peerId: string) => {
    console.log(`Peer ${peerId} disconnected`)
    const peer = this.peers.get(peerId)
    if (peer) {
      peer.disconnect()
      this.peers.delete(peerId)
    }
  }

  render() {
    const { children } = this.props
    if (typeof children === 'function') {
      const { myStream } = this.state
      const remotes = [...this.peers].map(([peerId, peer]) => peer)
      return children({ myStream, remotes })
    }
    return null
  }
}

decorate(WebRTCConnection, {
  peers: observable,
})

export default observer(WebRTCConnection)
