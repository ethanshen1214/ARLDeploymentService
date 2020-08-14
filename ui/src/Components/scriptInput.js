import React from 'react';
import PropTypes from "prop-types";

export default class Form extends React.Component { //component for an input form
    static propTypes = {
        submitHandler: PropTypes.func,
        onClose: PropTypes.func,
        formTitle: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
        script: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = { value: props.script };
        this.handleChange = this.handleChange.bind(this);
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.script !== this.props.script) {
            this.setState({ value: this.props.script });
        }
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.submitHandler(this.state.value);
    }
    closeEditModal = () => {
        this.props.onClose();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} style = {{ marginBottom: '30px' }}>
                <div>
                    <label>{this.props.formTitle}</label>
                </div>
                <div>
                    <textarea
                        type="text" 
                        value={this.state.value} 
                        onChange={this.handleChange} 
                        style = {{ marginRight: '20px',marginBottom: '20px', height: this.props.height, width: this.props.width }}
                    />
                </div>
                <div>
                    <input type="submit" value="Save Changes" />
                    {' | '}
                    <button onClick={this.closeEditModal}>Close</button>
                </div>
            </form>
        );
    }
}