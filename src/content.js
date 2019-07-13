/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactJson from 'react-json-view';
import Frame, { FrameContextConsumer }from 'react-frame-component';
import CloseImage from './res/img/close.png';
import ReactLoading from 'react-loading';

const style = {
  jsonView: {
    padding: "10px",
    borderRadius: "3px",
    margin: "10px 0px",
    fontSize: 15
  },
  loader: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 11
  }
}

class LoadingOverLay extends React.Component {
constructor(props) {
    super(props);
    this.state = {isVisible: false};
    this.showLoadingOverLay = this.showLoadingOverLay.bind(this);
    this.hideLoadingOverLay = this.hideLoadingOverLay.bind(this);
  }

  showLoadingOverLay = () => {
    console.log('showLoadingOverLay');
    this.setState({isVisible: true});
  }

  hideLoadingOverLay = () => {
    console.log('hideLoadingOverLay');
    this.setState({isVisible: false});
  }

  render() {
    return (
      <div style={{opacity: (this.state.isVisible? 1 : 0), position: 'fixed', top: 0, bottom: 0, right: 0, left: 0, transition: 'all 2s ease-out' }}>
        <div style={{ background: '#f2f2f2', position: 'fixed', opacity: 0.8, top: 0, bottom: 0, right: 0, left: 0 }} />
        <div style={style.loader}><ReactLoading type='spinningBubbles' color='#00b4f5' height={100} width={100} /></div>
      </div>
    )
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = { data: {} };
    this.loadingDiv = null;

    this.loadGithubJsonDataToIFrame = this.loadGithubJsonDataToIFrame.bind(this);
    this.receiveDataFromIframe = this.receiveDataFromIframe.bind(this);
    this.hideLoadingOverlay = this.hideLoadingOverlay.bind(this);
    this.showLoadingOverlay = this.showLoadingOverlay.bind(this);
  }

  showLoadingOverlay = () => {
    console.log(this.loadingDiv);
    this.loadingDiv != null && this.loadingDiv.showLoadingOverLay();
  }

  hideLoadingOverlay = () => {
    this.loadingDiv != null && this.loadingDiv.hideLoadingOverLay();
  }

  loadGithubJsonDataToIFrame = () => {
    console.log('loadGithubJsonDataToIFrame');
    this.showLoadingOverlay();

    let pageInfo = {
      hostname: document.location.host,
      pathname: document.location.pathname,
      url: document.location.href,
      domain: document.location.origin
    }

    var urlData = /github\.com\/([^/]+)\/?/.exec(pageInfo.url);

    let apiURL = `https://api.github.com/users/${urlData[1]}/repos`;
    console.log(`API => ${apiURL}`);
    window.postMessage({ type: "FROM_DISPLAY_PAGE", src: apiURL }, "*");
  }

  receiveDataFromIframe = (dataFromIframe) => {
    console.log("Content script data received: ===> ");
    console.log(dataFromIframe);
    dataFromIframe.sort((a, b) => b.stargazers_count - a.stargazers_count);
    let newState = Object.assign({}, this.state, { data: dataFromIframe });
    this.setState(newState);

    this.hideLoadingOverlay();
  }

  componentDidMount() {
    this.loadGithubJsonDataToIFrame();
  }

  static defaultProps = {
    theme: "rjv-default",
    src: null,
    collapsed: false,
    collapseStringsAfter: 100,
    onAdd: false,
    onEdit: false,
    onDelete: false,
    displayObjectSize: true,
    enableClipboard: true,
    indentWidth: 4,
    displayDataTypes: false,
    iconStyle: "square"
  }

    render() {
      const {
        collapseStringsAfter,
        onAdd,
        onEdit,
        onDelete,
        displayObjectSize,
        enableClipboard,
        theme,
        iconStyle,
        collapsed,
        indentWidth,
        displayDataTypes
      } = this.props;
        return (
            <Frame style={{width: '100%', height: '100%'}}> 
              <FrameContextConsumer>
              {
                // Callback is invoked with iframe's window and document instances
                  ({document, window}) => {
                    return (
                        <div style={{ position: 'relative', height: '100%', overflowX: 'auto' }}>
                        <LoadingOverLay ref={ref => this.loadingDiv = ref}/>
                          <img src={CloseImage} 
                            id='closeIcon'
                            alt='Click to close json page' 
                          style={{ borderRadius: 8, position: 'fixed', top: 10, right: 20, zIndex: 11, transition: 'all 0.3s ease-in-out' }}
                            onMouseOver={() => {
                              var el = document.getElementById('closeIcon');
                              el.style.boxShadow = '0 5px 10px 0 rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.19)';
                              el.style.transform = 'scale(1.3)';
                            }}
                            onMouseOut={() => {
                              var el = document.getElementById('closeIcon');
                              el.style.boxShadow = null;
                              el.style.transform = 'scale(1)';
                            }}
                            onClick={() => {
                              toggle();
                            }}/>
                          <ReactJson
                            name={false}
                            collapsed={collapsed}
                            style={style.jsonView}
                            theme={theme}
                            src={this.state.data}
                            collapseStringsAfterLength={collapseStringsAfter}
                            onEdit={
                              onEdit
                                ? e => {
                                  console.log(e)
                                  this.setState({ src: e.updated_src })
                                }
                                : false
                            }
                            onDelete={
                              onDelete
                                ? e => {
                                  console.log(e)
                                  this.setState({ src: e.updated_src })
                                }
                                : false
                            }
                            onAdd={
                              onAdd
                                ? e => {
                                  console.log(e)
                                  this.setState({ src: e.updated_src })
                                }
                                : false
                            }
                            displayObjectSize={displayObjectSize}
                            enableClipboard={enableClipboard}
                            indentWidth={indentWidth}
                            displayDataTypes={displayDataTypes}
                            iconStyle={iconStyle}
                          />
                        </div>
                      )
                  }
              }
            </FrameContextConsumer>
          </Frame>
        )
    }
}

const app = document.createElement('div');
app.id = "api-extension-div";
app.style.width = "100%";
app.style.zIndex = -1;
app.style.opacity = 0;
app.style.top = '0px';
app.style.bottom = '0px';
app.style.left = '0px';
app.style.right = '0px';
app.style.background = '#fff';
app.style.position = 'fixed';
app.style.transition = "all 0.3s ease-in-out";
document.body.appendChild(app);
const currentPath = document.location.pathname;
ReactDOM.render(<Main pathName={currentPath} ref={(contentComponent) => { window.contentComponent = contentComponent }}/>, app);

chrome.runtime.onMessage.addListener(
   function(message, Callback) {
    if (message.page === "background" && message.status === "VIEW_API_JSON") {
        toggle();
      }
   }
);

function toggle(){
    if (app.style.zIndex === "-1") {
      console.log('open data view');
      app.style.zIndex = "10000000";
      app.style.opacity = 1;
    } else {
      console.log('close data view');
      app.style.zIndex = "-1";
      app.style.opacity = 0;
    }
}

window.addEventListener("message", function (event) {
  if (event.data.type && (event.data.type === "FROM_IFRAME_DATA_PAGE")) {
    window.contentComponent.receiveDataFromIframe(event.data.responseJson);
  }
}, false);