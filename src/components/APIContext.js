import { Component, PropTypes, Children } from 'react'

export default class APIContext extends Component {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
    authToken: PropTypes.string.isRequired
  };

  static childContextTypes = {
    baseUrl: PropTypes.string.isRequired,
    authToken: PropTypes.string.isRequired
  };

  getChildContext() {
    const { baseUrl, authToken } = this.props
    return { baseUrl, authToken }
  }

  render() {
    const { children } = this.props
    return Children.only(children)
  }
}
