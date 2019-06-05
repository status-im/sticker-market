import React from 'react';
import ReactDOM from 'react-dom';
import EmbarkJS from 'Embark/EmbarkJS';
import TestStatusNetworkUI from './components/TestStatusNetwork';

import './dapp.css';

class App extends React.Component {

  constructor(props) {
    super(props);


    this.state = {
      error: null,
      blockchainEnabled: false  
    };
  }

  componentDidMount() {
    EmbarkJS.onReady((err) => {
      this.setState({blockchainEnabled: true});
      if (err) {
        // If err is not null then it means something went wrong connecting to ethereum
        // you can use this to ask the user to enable metamask for e.g
        return this.setState({error: err.message || err});
      }
    });
  }



  render() {
    if (this.state.error) {
      return (<div>
        <div>Something went wrong connecting to ethereum. Please make sure you have a node running or are using metamask to connect to the ethereum network:</div>
        <div>{this.state.error}</div>
      </div>);
    }
    return (<div>
      <TestStatusNetworkUI />
    </div>);
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));
