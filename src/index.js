import * as React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import './index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root'),
  )
}

registerServiceWorker()

render(App)

if (module.hot) {
  module.hot.accept('./components/App', () => {
    render(App)
  })
}
