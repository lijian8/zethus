import React from 'react';
import styled from 'styled-components';
import Tree from './Tree';

import { ButtonPrimary } from '../../components/styled';
import {
  ModalWrapper,
  ModalContents,
  ModalTitle,
} from '../../components/styled/modal';
import {
  stopPropagation,
  generateGraph,
  ROS_SOCKET_STATUSES,
} from '../../utils';
import API_CALL_STATUS from '../../utils/constants';
import VisualizationHelperToolbar from './visualizationToolbar';

const GraphContainer = styled.div`
  border: 1px solid red;
  display: flex;
  height: 90%;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  & > svg {
    width: 100%;
    height: 100%;
    z-index: 10 !important;
  }
`;

const ModalHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledModalContents = styled(ModalContents)`
  height: 90%;
  width: 90%;
  margin: auto;
  margin-top: 5vh;
`;

class ConfigurationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: null,
      status: API_CALL_STATUS.FETCHING,
      visualizationToolbarSettings: {
        debug: true,
        nodeSelect: 0,
      },
    };
    this.graphContainerRef = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createGraph = this.createGraph.bind(this);
    this.refreshGraph = this.refreshGraph.bind(this);
    this.returnContainerRef = this.returnContainerRef.bind(this);
    this.changeVisualizationToolbar = this.changeVisualizationToolbar.bind(
      this,
    );
    this.selectHandler = this.selectHandler.bind(this);
  }

  createGraph() {
    const { ros } = this.props;
    const p = generateGraph(ros);
    p.then(graph => {
      this.setState({ graph, status: API_CALL_STATUS.SUCCESSFUL });
    }).catch(err => {
      console.log(err);
      this.setState({
        status: API_CALL_STATUS.ERROR,
      });
    });
  }

  selectHandler(e) {
    this.setState(function({ visualizationToolbarSettings }) {
      return {
        visualizationToolbarSettings: {
          ...visualizationToolbarSettings,
          nodeSelect: e.value,
        },
      };
    });
  }

  changeVisualizationToolbar(e) {
    const {
      checked,
      dataset: { id },
    } = e.target;
    this.setState(function({ visualizationToolbarSettings }) {
      return {
        visualizationToolbarSettings: {
          ...visualizationToolbarSettings,
          [id]: checked,
        },
      };
    });
  }

  refreshGraph(e) {
    e.preventDefault();
    this.createGraph();
  }

  returnContainerRef() {
    return this.graphContainerRef;
  }

  componentDidMount() {
    this.createGraph();
  }

  handleSubmit() {
    const { updateConfiguration } = this.props;
    const config = this.jsonEditor.get();
    updateConfiguration(config);
  }

  render() {
    const { closeModal, rosStatus } = this.props;
    const {
      graph,
      status,
      visualizationToolbarSettings: { debug },
    } = this.state;

    let data = null;
    if (status === API_CALL_STATUS.SUCCESSFUL) {
      data = (
        <Tree
          returnContainerRef={this.returnContainerRef}
          graph={graph}
          debug={debug}
        />
      );
    } else if (status === API_CALL_STATUS.ERROR) {
      data = (
        <p>
          Error{' '}
          <ButtonPrimary onClick={this.refreshGraph}>Refresh</ButtonPrimary>
        </p>
      );
    } else {
      data = <p>Loading.</p>;
    }
    console.log();
    return (
      <ModalWrapper onClick={closeModal}>
        <StyledModalContents onClick={stopPropagation}>
          <ModalHeading>
            <ModalTitle>Graph </ModalTitle>
            <ButtonPrimary
              disabled={rosStatus !== ROS_SOCKET_STATUSES.CONNECTED}
              onClick={this.refreshGraph}
            >
              {rosStatus === ROS_SOCKET_STATUSES.CONNECTED
                ? 'Refresh'
                : 'Websocket disconnected.'}
            </ButtonPrimary>
          </ModalHeading>
          <VisualizationHelperToolbar
            changeVisualizationToolbar={this.changeVisualizationToolbar}
            selectHandler={this.selectHandler}
            debug={debug}
          />
          <GraphContainer ref={this.graphContainerRef}>{data}</GraphContainer>
        </StyledModalContents>
      </ModalWrapper>
    );
  }
}

export default ConfigurationModal;
