import React, { Component, PropTypes } from 'react';
import { Badge, Button, Tooltip, Popover, OverlayTrigger } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Topics } from '../api/topics.js';

import Form from './Form.jsx';
 
// Topic component - represents a single topic item
export default class Topic extends Component {
    secondthistopic() {
  		if(this.props.username === 'admin') {
            ReactDOM.render(<Form topic={this.props.topic} username={this.props.username}  />, document.getElementById('inputarea'));
            return;
        }

        if( (this.props.topic.sponsor === this.props.username) &&
            (this.props.topic.replied === 0) ) {
            Topics.remove(this.props.topic._id);
        }

        if(this.props.topic.sponsor !== this.props.username) {
            let newlist = this.props.topic.secondlist.slice();
            let index = this.props.topic.secondlist.indexOf(this.props.username);
            let newSeconded;

            if( index === -1) {
                newSeconded = this.props.topic.seconded + 1;
                newlist.push(this.props.username);
            }
            else {
                newSeconded = this.props.topic.seconded - 1;
                newlist.splice(index, 1);
            }
            
            Topics.update(this.props.topic._id, 
                            { $set: { seconded: newSeconded,
                                      secondlist: newlist
                                    } 
                            }
                         );
        }
  	}

    comment() {
        if(this.props.username === 'admin') {
            return;
        }

        if(this.props.topic.replied === 0) {
            return ;
        }

        const acceptindex = this.props.topic.acceptlist.indexOf(this.props.username);
        const suckindex = this.props.topic.sucklist.indexOf(this.props.username);
        let newacceptlist = this.props.topic.acceptlist.slice();
        let newsucklist = this.props.topic.sucklist.slice();

        if(acceptindex !== -1) {
            newacceptlist.splice(acceptindex, 1);
            newsucklist.push(this.props.username);
            Topics.update(this.props.topic._id, 
                            { $set: { accept: this.props.topic.accept-1,
                                      acceptlist: newacceptlist,
                                      suck: this.props.topic.suck+1,
                                      sucklist: newsucklist,
                                    } 
                            }
                         );
        }
        else if(suckindex !== -1) {
            newsucklist.splice(suckindex, 1);
            Topics.update(this.props.topic._id, 
                            { $set: { suck: this.props.topic.suck-1,
                                      sucklist: newsucklist,
                                    } 
                            }
                         );
        }
        else {
            newacceptlist.push(this.props.username);
            Topics.update(this.props.topic._id, 
                            { $set: { accept: this.props.topic.accept+1,
                                      acceptlist: newacceptlist
                                    } 
                            }
                         );
        }

        return;
    }

    renderDetail() {
        const tooltip = (<Tooltip id={'tip'+this.props.topic._id}>{this.props.topic.description}</Tooltip>);
        const popover = (<Popover id={'pop'+this.props.topic._id} title="回應">{this.props.topic.anwser}</Popover>);
        if(this.props.topic.replied === 0) {
            return (<OverlayTrigger overlay={tooltip} placement="top">
                        <strong>{this.props.topic.title}</strong>
                    </OverlayTrigger>);
        }
        else {
            return (<OverlayTrigger overlay={popover} placement="bottom">
                        <OverlayTrigger overlay={tooltip} placement="top">
                            <strong>{this.props.topic.title}</strong>
                        </OverlayTrigger>
                    </OverlayTrigger>);
        }
    }

    renderStatistic() {
        return (
                <span>
                    <span> <Badge>{this.props.topic.seconded}</Badge></span>
                    <span> <Badge style={this.renderLightBulb('limegreen')}>{this.props.topic.accept}</Badge></span>
                    <span> <Badge style={this.renderLightBulb('crimson')}>{this.props.topic.suck}</Badge></span>
                </span>
               );
    }

    renderLightBulb(color) {
        if(this.props.topic.replied === 0) {
            return ({background: "silver", opacity:0.3});
        }

        return ({background: color});
    }

    renderStatusButton() {
        if(this.props.topic.replied === 1) {
            if(this.props.username === 'admin') {
                return (<Button bsSize="xsmall" disabled>Done</Button>);
            }
        }

        if(this.props.topic.replied === 0) {
            return (<Button bsSize="xsmall" disabled>Pending</Button>);
        }

        const acceptindex = this.props.topic.acceptlist.indexOf(this.props.username);
        const suckindex = this.props.topic.sucklist.indexOf(this.props.username);
        if(acceptindex !== -1) {
            return (<Button bsSize="xsmall" bsStyle="success" onClick={this.comment.bind(this)}>接受</Button>);
        }
        else if(suckindex !== -1) {
            return (<Button bsSize="xsmall" bsStyle="danger" onClick={this.comment.bind(this)}>打槍</Button>);
        }

        return (<Button bsSize="xsmall" onClick={this.comment.bind(this)}>考慮</Button>);
    }

    renderAction() {
        if(this.props.username === 'admin') {
            return 'Reply';
        }

        if(this.props.topic.sponsor === this.props.username) {
            return 'Del';
        }

        if(this.props.topic.secondlist.indexOf(this.props.username) !== -1) {
            return (<img src={'/second.png'} width="20px" />);
        }

        return (<img className="opacity" src={'/second.png'} width="20px" />);
    }

    render() {
        return (
            <li>
                <span>
                    {this.renderDetail()}
                </span>

                {this.renderStatistic()}
                
                <span className="buttongroup">
                    {this.renderStatusButton()}
                    <button className="noborderbutton" onClick={this.secondthistopic.bind(this)}>
                        {this.renderAction()}
                    </button>
                </span>
      		</li>
    	);
  	}
}
 
Topic.propTypes = {
  	// This component gets the topic to display through a React prop.
  	// We can use propTypes to indicate it is required
  	topic: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
};