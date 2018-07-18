// @flow

import * as React from 'react'
import { withRouter } from 'react-router-dom'
import type { RouterHistory } from 'react-router-dom'

import Button from './Button'
import Container from './Container'
import Heading from './Heading'
import Content from './Content'
import FormContainer from './FormContainer'
import Input from './Input'

type Props = {
  history: RouterHistory,
}

type State = {
  roomName: string,
}

class Home extends React.Component<Props, State> {
  state = {
    roomName: '',
  }

  handleFormSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (this.state.roomName.length > 0) {
      this.props.history.push(`/room/${this.state.roomName}`)
    }
  }

  handleInputChange = (event: SyntheticKeyboardEvent<HTMLInputElement>): void => {
    const roomName = event.currentTarget.value

    this.setState({ roomName })
  }

  render(): React.Node {
    return (
      <Container>
        <Content>
          <Heading>Nashwan Chat</Heading>
          <FormContainer onSubmit={this.handleFormSubmit}>
            <Input
              type="text"
              placeholder="Enter a room name"
              value={this.state.roomName}
              onChange={this.handleInputChange}
            />
            <Button type="submit">Join</Button>
          </FormContainer>
        </Content>
      </Container>
    )
  }
}

export default withRouter(Home)
