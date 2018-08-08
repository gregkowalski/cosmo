import React from 'react';
import PropTypes from 'prop-types';
import { LowerMainlandBounds } from './Map/RegionUtil'

export default class ReactGoogleAutocomplete extends React.Component {
    static propTypes = {
        onPlaceSelected: PropTypes.func,
        types: PropTypes.array,
        componentRestrictions: PropTypes.object,
        bounds: PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.autocomplete = null;
        this.event = null;
    }

    componentDidMount() {
        const { types = ['(cities)'], componentRestrictions, bounds, } = this.props;
        const config = {
            types,
            bounds,
        };

        // Limit search results to Lower Mainlain area for now
        config.bounds = LowerMainlandBounds;
        config.strictBounds = true;

        if (componentRestrictions) {
            config.componentRestrictions = componentRestrictions;
        }

        this.autocomplete = new window.google.maps.places.Autocomplete(this.input, config);
        this.event = this.autocomplete.addListener('place_changed', this.onSelected.bind(this));
    }

    componentWillUnmount() {
        this.event.remove();
    }

    setInputRef = (input) => {
        this.input = input;
        if (this.props.onRef) {
            this.props.onRef(input);
        }
    }

    onSelected() {
        if (this.props.onPlaceSelected) {
            this.props.onPlaceSelected(this.autocomplete.getPlace());
        }
    }

    render() {
        const { onPlaceSelected, onKeyDown, types, componentRestrictions, bounds, onRef, ...rest } = this.props;

        return (
            <input onKeyDown={onKeyDown}
                ref={this.setInputRef}
                {...rest}
            />
        );
    }
}

export class ReactCustomGoogleAutocomplete extends React.Component {
    static propTypes = {
        input: PropTypes.node.isRequired,
        onOpen: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.service = new window.google.maps.places.AutocompleteService();
    }

    onChange(e) {
        const { types = ['(cities)'] } = this.props;

        if (e.target.value) {
            this.service.getPlacePredictions({ input: e.target.value, types }, (predictions, status) => {
                if (status === 'OK' && predictions && predictions.length > 0) {
                    this.props.onOpen(predictions);
                    console.log(predictions);
                } else {
                    this.props.onClose();
                }
            });
        } else {
            this.props.onClose();
        }
    }

    componentDidMount() {
        if (this.props.input.value) {
            this.placeService = new window.google.maps.places.PlacesService(this.refs.div);
            this.placeService.getDetails({ placeId: this.props.input.value }, (e, status) => {
                if (status === 'OK') {
                    this.refs.input.value = e.formatted_address;
                }
            });
        }
    }

    render() {
        return (
            <div>
                {React.cloneElement(this.props.input,
                    {
                        ...this.props,
                        ref: 'input',
                        onChange: (e) => {
                            this.onChange(e);
                        },
                    }
                )}
                <div ref="div"></div>
            </div>
        );
    }
}