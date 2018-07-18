import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Chat from './chat/Chat'
import Home from './home/Home'

const App = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/room/:roomName" component={Chat} />
      </Switch>
    </Router>
  </div>
)

export default App
