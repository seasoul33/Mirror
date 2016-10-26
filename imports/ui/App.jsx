import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Topics } from '../api/topics.js';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
 
import Topic from './Topic.jsx';
import Form from './Form.jsx';

import Switch from 'react-toggle-switch';
 
// App component - represents the whole app
class App extends Component {
    constructor() {
        super();
        this.state = {tags:[], sort_by_time:false, showModal:false, topic:{}};
    }
    
    renderTopics() {
        if(this.props.currentUser) {
            let fileteredTopics;
            let sortedTopics;

            if(this.state.sort_by_time === true) {
                sortedTopics = this.props.topics_time;
            }
            else {
                sortedTopics = this.props.topics;
            }

            if(this.state.tags.length !== 0) {
                fileteredTopics = this.state.tags.reduce( function(resultTopics, tag) {
                                            return resultTopics.filter((topic) => (topic.tags.includes(tag)));
                                        }, sortedTopics);
            }
            else {
                fileteredTopics = [...sortedTopics];
            }

            // console.log(fileteredTopics);

            return fileteredTopics.map((topic) => (
                <Topic key={topic._id} topic={topic} username={this.props.currentUser.username} selecttopic={this.selecttopic.bind(this)} />
            ));
        }
        else {
            return '';
        }
    }

    selecttopic(topic) {
        if(this.props.currentUser) {
            this.setState({topic,showModal:true});
        }
    }

    renderForm() {
        if(this.props.currentUser) {
            return (<Form topic={this.state.topic} username={this.props.currentUser.username} aftersubmit={this.closeModal.bind(this)} />);
        }
        else {
            return '';
        }
    }

    searchtag(event) {
        const tags = event.target.value.split(' ').filter((tag) => (tag !== ''));
        this.setState({tags});
    }

    switchSorting() {
        this.setState({sort_by_time:(!this.state.sort_by_time)});
    }

    toggleSwitchLabelStyle (labelnum){
        const style_enabled = {color:'black', opacity:1};
        const style_disabled = {color:'gray', opacity:0.5};
        if(labelnum === 1) {
            return this.state.sort_by_time ? style_disabled : style_enabled;
        }
        else {
            return this.state.sort_by_time ? style_enabled : style_disabled;
        }
    }

    openModal() {
        if(this.props.currentUser.username !== 'admin') {
            this.setState({showModal:true});
        }
    }

    closeModal() {
        this.setState({showModal:false});
    }
 
    render() {
        return (
            <div className="container">
                <header>
                    <h1 className="title">Wanted Board</h1><br/>
                    <span>
                        <span><label ref="switchlabel1" style={this.toggleSwitchLabelStyle(1)}>以附議數量排序 </label></span>
                        <span><Switch on={this.state.sort_by_time} onClick={this.switchSorting.bind(this)} /></span> 
                        <span><label ref="switchlabel2" style={this.toggleSwitchLabelStyle(2)}> 以提問時間排序</label></span>
                    </span>
                    <AccountsUIWrapper />
                </header>

                <div className="container-toolbar">
                    <div className="searchbox">
                        Search the tag...
                        <input type="text" placeholder="" onChange={this.searchtag.bind(this)} />
                    </div>
                    <br/>
                    <Button className="forminvokeButton" bsStyle="primary" bsSize="xsmall" onClick={this.openModal.bind(this)}>舉手發問</Button>
                </div>
 
                <div className="container-topic">
                        <ul>
                            {this.renderTopics()}
                        </ul>
                </div>

                <Modal show={this.state.showModal} onHide={this.closeModal.bind(this)}>
 
                    <Modal.Body>
                        <Button className="closeModal" bsSize="xsmall" onClick={this.closeModal.bind(this)}>Close</Button>
                        <div id="inputarea">
                            {this.renderForm()}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

App.propTypes = {
    topics: PropTypes.array.isRequired,
    topics_time: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
};
 
export default createContainer(() => {
    return {
        topics: Topics.find({}, { sort: { seconded: -1 } }).fetch(),
        topics_time: Topics.find({}, { sort: { raisedAt: -1 } }).fetch(),
        currentUser: Meteor.user(),
    };
}, App);