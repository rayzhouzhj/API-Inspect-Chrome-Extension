/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';

class GithubDataFrame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {apiURL: ""};
    this.updateIframeSrc = this.updateIframeSrc.bind(this);
  }

  updateIframeSrc = (src) => {
    this.setState({ apiURL: src });
  }

  componentDidMount() {
    console.log(`iFrame PAGE for github`);
    if (document.location.href.indexOf('api.github.com') > 0) {
      try {
        let jsonData = JSON.parse(document.body.innerText);
        window.parent.postMessage({ type: "FROM_IFRAME_DATA_PAGE", responseJson: jsonData }, "*");
      } catch (e) {
        console.log(e);
      }
    }
  }

    render() {
        return (
            <iframe title='github_data_iframe' src={this.state.apiURL} style={{ zIndex: -1, width: 0, height: 0, border: 'none' }} />
        )
    }
}

const app = document.createElement('div');
app.id = "api-extension-github-iframe-div";
app.style.width = "100%";
app.style.zIndex = -1;
app.style.opacity = 0;
app.style.transition = "all 0.3s ease-in-out";
document.body.appendChild(app);
const currentPath = document.location.pathname;
ReactDOM.render(<GithubDataFrame pathName={currentPath} ref={(dataIframeComponent) => { window.dataIframeComponent = dataIframeComponent }}/>, app);


window.addEventListener("message", function (event) {
  if (event.data.type && (event.data.type === "FROM_DISPLAY_PAGE")) {
    window.dataIframeComponent.updateIframeSrc(event.data.src);
  }
}, false);