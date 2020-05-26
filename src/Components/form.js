import React, {Component} from 'react';
import PropTypes from "prop-types";

export default class Form extends React.Component {
    static propTypes = {
        submitHandler: PropTypes.func,
    };
    
    constructor(props) {
      super(props);
      this.state = {value: ''};
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit = () => {
        this.props.submitHandler(this.state.value);
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Authorization Token:
            <input type="text" value={this.state.value} onChange={this.handleChange} style = {{ marginLeft: '20px', marginRight: '20px'}}/>
          </label>
          <input type="submit" value="Submit" />
        </form>
      );
    }
  }