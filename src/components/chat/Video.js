// @flow

import * as React from 'react'

type Props = {
  stream: HTMLSourceElement,
  style: any,
}

class Video extends React.PureComponent<Props> {
  video: ?{
    srcObject: ?HTMLSourceElement,
  }

  componentDidMount() {
    if (this.video) {
      this.video.srcObject = this.props.stream
    }
  }

  componentDidUpdate() {
    if (this.video) {
      this.video.srcObject = this.props.stream
    }
  }

  render() {
    const { stream, ...props } = this.props

    return (
      <video
        ref={video => {
          this.video = video
        }}
        autoPlay
        {...props}
      />
    )
  }
}

export default Video
