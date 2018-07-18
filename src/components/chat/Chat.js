// @flow

import * as React from 'react'
import styled from 'styled-components'
import type { Match } from 'react-router-dom'

import WebRTCConnection from './WebRTCConnection'
import Video from './Video'
import type Peer from './Peer'

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #323a3e;
`

const WaitingMessageContainer = styled.div`
  color: #fefefe;
  background-color: #222222;
  opacity: 0.75;
  padding: 0 15px;
  position: absolute;
  top: 40vh;
  left: 40vw;
  @media (max-width: 480px) {
    left: 5vw;
  }
`

const ChatRoomName = styled.div`
  color: #fefefe;
  background-color: #323a3e;
  position: absolute;
  top: 5px;
  left: 10px;
  padding: 0 15px;
`

type Props = {
  match: Match,
}

class Chat extends React.Component<Props> {
  renderRemotes(remotes: (?Peer)[]): React.Node {
    const remoteVideoStyles = {
      height: '100%',
      width: `${100 / remotes.length}%`,
    }

    return remotes.map(
      remote =>
        remote && remote.stream ? (
          <div className="remote-container" id={`container__${remote.id}`} key={remote.id}>
            <Video autoPlay stream={remote.stream} style={remoteVideoStyles} />
          </div>
        ) : null,
    )
  }

  render() {
    const { match: { params: { roomName } } = { params: { roomName: '/' } } } = this.props
    return (
      <WebRTCConnection url="https://nashwanchat.herokuapp.com" roomName={roomName}>
        {({ myStream, remotes }) => {
          const haveRemotes = remotes.length ? true : false

          let localVideoStyles

          if (haveRemotes) {
            localVideoStyles = {
              width: '150px',
              height: '150px',
              position: 'absolute',
              bottom: 0,
              right: 0,
            }
          } else {
            localVideoStyles = {
              width: '100%',
              height: '100%',
              objectFit: 'initial',
            }
          }

          return (
            <ChatContainer>
              <Video stream={myStream} style={localVideoStyles} muted />
              <ChatRoomName>
                <h2>{roomName}</h2>
              </ChatRoomName>
              {haveRemotes ? (
                <div className="remotes">{this.renderRemotes(remotes)}</div>
              ) : (
                <WaitingMessageContainer>
                  <h3>Waiting for people to join</h3>
                </WaitingMessageContainer>
              )}
            </ChatContainer>
          )
        }}
      </WebRTCConnection>
    )
  }
}

export default Chat
