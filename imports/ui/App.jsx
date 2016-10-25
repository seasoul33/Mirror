import React, { Component, PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
 
import { Topics } from '../api/topics.js';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
 
import Topic from './Topic.jsx';
import Form from './Form.jsx';
 
// App component - represents the whole app
class App extends Component {
    constructor() {
        super();
        this.state = {tags:[]};
    }
    
    renderTopics() {
        if(this.props.currentUser) {
            let fileteredTopics;

            if(this.state.tags.length !== 0) {
                fileteredTopics = this.state.tags.reduce( function(resultTopics, tag) {
                                            return resultTopics.filter((topic) => (topic.tags.includes(tag)));
                                        }, this.props.topics);
            }
            else {
                fileteredTopics = [...this.props.topics];
            }

            // console.log(fileteredTopics);

            return fileteredTopics.map((topic) => (
                <Topic key={topic._id} topic={topic} username={this.props.currentUser.username} />
            ));
        }
        else {
            return '';
        }
    }

    renderForm() {
        if(this.props.currentUser) {
            if(this.props.currentUser.username === 'admin') {
                return '';
            }
            return (<Form topic={{}} username={this.props.currentUser.username} />);
        }
        else {
            return '';
        }
    }

    searchtag(event) {
        const tags = event.target.value.split(' ').filter((tag) => (tag !== ''));
        this.setState({tags});
    }
 
    render() {
        return (
            <div className="container">
                <header>
                    <h1>Wanted Board</h1>
                    <AccountsUIWrapper />
                </header>

                <div className="container-toolbar">
                    <div className="searchbox">
                        Search the tag...
                        <input type="text" placeholder="" onChange={this.searchtag.bind(this)} />
                    </div>
                    <br/><br/><br/><br/>
                    <div style={{height:'200px', width:'180px', padding:'0 0 0 0.8em'}}>
                        預計把提出問題的表單拉到這裡變成點擊後浮現的視窗
                    </div>
                </div>
 
                <div className="container-topic">
                        <ol>
                            {this.renderTopics()}
                        </ol>

                        <br/><br/><br/>
                        <div id="inputarea">
                            {this.renderForm()}
                        </div>
                </div>
            </div>
        );
    }
}

App.propTypes = {
    topics: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
};
 
export default createContainer(() => {
    return {
        topics: Topics.find({}, { sort: { seconded: -1 } }).fetch(),
        currentUser: Meteor.user(),
    };
}, App);