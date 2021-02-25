/* eslint-disable react/no-set-state,react/jsx-handler-names */
import React, { Component }                    from "react";
import { connect }                             from "react-redux";
import { change, reduxForm }                   from "redux-form";
import { Button, Divider, Form, Header, Icon } from "semantic-ui-react";
import { createEvent, login }                  from "../../../actions/actions";
import AdminForm                               from "../../../forms/AdminForm";
import ReactImageFallback                      from "react-image-fallback";
import { Media }                               from "react-bootstrap";
import * as Utils                              from "../../../utils";
import * as Constants                          from "../../../constants";
import ReactFileReader                         from "react-file-reader";
import axios                                   from "axios/index";


function validate( values ) {
	const errors = {};

	if ( !values.eventName ) {
		errors.eventName = "* required";
	}

	if ( !values.description ) {
		errors.description = "* required";
	}

	return errors;
}

class NewEventFormPage2 extends Component {

	constructor( props ) {
		super( props );

		this.state = {
			src: ""
		};

		this.upload      = this.upload.bind( this );
		this.sendFile    = this.sendFile.bind( this );
		this.handleFiles = this.handleFiles.bind( this );
		// this.makeForm = this.makeForm( this );

		// Bind callback methods to make `this` the correct context.
	}

	static handleError( src ) {
		Utils.debugLogger( "new_event_form_page2: can't find image: [" + src + "]" );
	}

	componentWillMount() {
		this.setState( {src: this.props.imageUrl} );
	}


	upload( blob ) {

		axios.get( `${Constants.MEDIA_UPLOAD_URL}?method=PUT` ).then( ( response ) => {
			this.sendFile( response, blob );
		} );
	}


	sendFile( response, blob ) {

		let data = response.data;

		if ( _.get( response, "data.uploadUrl" ) && _.get( response, "data.downloadUrl" ) ) {

			console.log( "uploadUrl=" + data.uploadUrl );
			console.log( "downloadUrl=" + data.downloadUrl );

			const self = this;

			axios.put( data.uploadUrl, blob, {
				headers: {
					"Content-Type": blob.type
				}
			} ).then( function ( response ) {
				// console.log( response );
				self.setState( {src: data.downloadUrl} );
				self.props.dispatch( change( "newEventForm", "imageUrl", data.downloadUrl ) );
			} ).catch( function ( error ) {
				console.log( error );
			} );


		}
	}

	dataURLtoBlob( dataURI ) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		let byteString;
		if ( dataURI.split( "," )[ 0 ].indexOf( "base64" ) >= 0 )
			byteString = atob( dataURI.split( "," )[ 1 ] );
		else
			byteString = decodeURI( dataURI.split( "," )[ 1 ] );

		// separate out the mime component
		let mimeString = dataURI.split( "," )[ 0 ].split( ":" )[ 1 ].split( ";" )[ 0 ];

		// write the bytes of the string to a typed array
		let ia = new Uint8Array( byteString.length );
		for ( let i = 0; i < byteString.length; i++ ) {
			ia[ i ] = byteString.charCodeAt( i );
		}

		return new Blob( [ ia ], {type: mimeString} );
	}

	handleFiles( files ) {

		let file = "";

		if ( files.base64.length ) {
			file = files.base64[ 0 ];
		}


		this.setState( {src: file} ); // update the image display


		this.upload( this.dataURLtoBlob( file ) );

	}

	render() {

		const {
				  previousPage
			  } = this.props;

		const {handleSubmit} = this.props;

		const imageContainerStyle = {
			width : 300,
			height: Constants.EVENT_IMAGE_SIZE
		};

		const logoStyle = {
			objectFit: "contain",
			width    : Constants.EVENT_IMAGE_SIZE,
			height   : Constants.EVENT_IMAGE_SIZE
			// marginTop: 5
		};

		const panelTitleStyle = {
			paddingTop : 0,
			paddingLeft: 0
		};

		const fallBackImage = `https://picsum.photos/${Constants.EVENT_IMAGE_SIZE}`;

		return (
			<AdminForm id="new-event-panel">
				<Form onSubmit={ handleSubmit }>

					<Header style={ {fontFamily: "Roboto"} }>{ "Image Upload: [2 of 6]" }</Header>
					<Divider/>

					<Media>
						<Media.Left style={ imageContainerStyle }>
							<ReactImageFallback
								src={ this.state.src ? this.state.src : require( "../../../../static/images/predicta-logo.svg" ) }
								fallbackImage={ fallBackImage }
								alt="logo"
								style={ logoStyle }
								onError={ NewEventFormPage2.handleError }/>
						</Media.Left>
						<Media.Body style={ panelTitleStyle }>
							<h3>{ "" }</h3>
						</Media.Body>
					</Media>

					<div style={ {marginTop: "10px", marginBottom: "8px"} }>
						<ReactFileReader
							fileTypes={ [ ".jpg", ".jpeg", ".png" ] } base64
							multipleFiles
							handleFiles={ this.handleFiles }>
							<Button>{ "upload" }</Button>
						</ReactFileReader>
					</div>


					{ /*<Form.Field>*/ }
					{ /*<Field*/ }
					{ /*key={ "imageUrl" }*/ }
					{ /*hidden={true}*/ }
					{ /*name={ "imageUrl" }*/ }
					{ /*ref={ "imageUrl" }*/ }
					{ /*type={ "text" }*/ }
					{ /*placeholder={ "image url" }*/ }
					{ /*component={ renderField }*/ }
					{ /*label={ "url" }*/ }
					{ /*onChange={(event, newValue, previousValue) => this.state.src=newValue}*/ }
					{ /*/>*/ }
					{ /*</Form.Field>*/ }

					<Form.Field id="event-buttons">
						<Form.Group>
							<Button type="button" className="previous" onClick={ previousPage } icon>
								<Icon name='left arrow'/>
								{ "Previous" }
							</Button>
							<Button type="submit" className="next" onSubmit={ this.props.onSubmit } icon>
								{ "Next" }
								<Icon name='right arrow'/>
							</Button>
						</Form.Group>
					</Form.Field>

				</Form>

			</AdminForm>
		);
	}
}


function mapStateToProps( state ) {
	return {
		imageUrl                   : _.get( state, "form.newEventForm.values.imageUrl", "" ),
		publicationsSelectorOptions: state.category.categoryData.publications.publicationsSelectorOptions
	};
}

NewEventFormPage2 = reduxForm( {
	form                    : "newEventForm",  // a unique identifier for this form
	destroyOnUnmount        : false, //        <------ preserve form data
	forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
	validate
} )( NewEventFormPage2 );

NewEventFormPage2 = connect( mapStateToProps, {login, createEvent} )( NewEventFormPage2 );

export default NewEventFormPage2;
