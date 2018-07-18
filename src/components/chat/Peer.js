// @flow

import PeerConnection from 'rtcpeerconnection'
import { observable, decorate } from 'mobx'

const cfg = {
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

type IceServer = {
  urls: string,
  credential?: string,
  username?: string,
}

type MediaEvent = {
  stream: HTMLSourceElement,
}

type Props = {
  config?: {
    iceServers: IceServer[],
  },
  onIceCandidate: (candidate: any, peerId: string) => void,
  stream: HTMLSourceElement,
  peerId: string,
}

class Peer {
  // PeerConnection object
  pc: any
  // Peer's socket connection id to send targeted messages such as exchanging ice candidates
  id: string
  // Peer's stream
  stream: ?HTMLSourceElement

  constructor({ config = cfg, onIceCandidate, stream, peerId }: Props) {
    this.pc = new PeerConnection(config)
    this.id = peerId
    this.stream = null

    // Add event handlers
    this.pc.on('ice', candidate => onIceCandidate(candidate, this.id))
    this.pc.on('addStream', this.handleAddStream)
    this.pc.on('removeStream', this.handleRemoveStream)
    // Add the user's own stream
    this.pc.addStream(stream)
  }

  handleAddStream = (event: MediaEvent) => {
    this.stream = event.stream
  }

  handleRemoveStream = () => {
    this.stream = null
  }

  createOffer = () => {
    return new Promise((resolve, reject) => {
      this.pc.offer((err, offer) => {
        if (err) return reject(err)
        resolve(offer)
      })
    })
  }

  handleOffer = (offer: any) => {
    return new Promise((resolve, reject) => {
      this.pc.handleOffer(offer, err => {
        if (err) return reject(err)

        this.pc.answer((err, answer) => {
          if (err) return reject(err)
          resolve(answer)
        })
      })
    })
  }

  handleAnswer = (answer: any) => {
    this.pc.handleAnswer(answer)
  }

  processIce = (candidate: any) => {
    this.pc.processIce(candidate)
  }

  disconnect = () => {
    this.pc.close()
  }
}

export default decorate(Peer, {
  stream: observable,
})
