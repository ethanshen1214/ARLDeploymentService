import React, {Component} from 'react';
import PropTypes from "prop-types";

export default class Form extends React.Component {
    static propTypes = {
        submitHandler: PropTypes.func,
        formTitle: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
    };
    
    constructor(props) {
      super(props);
      this.state = {value: ''};
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.submitHandler(this.state.value);
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit} style = {{marginLeft: '20px', marginTop: '10px'}}>
          <div>
            <label>{this.props.formTitle}</label>
          </div>
          <div>
              <textarea
                type="text" 
                value={this.state.value} 
                onChange={this.handleChange} 
                style = {{ marginRight: '20px', height: this.props.height, width: this.props.width}}
                />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
          
        </form>
      );
    }
  }