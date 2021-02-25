import _            from "lodash";
import { defaults } from "react-chartjs-2";

// globals for chart.js
_.merge( defaults, {
	global: {
		title            : {
			display  : true,
			text     : "text",
			fontSize : 20,
			padding  : 30,
			fullWidth: false,
			fontColor: "#000",
			fontStyle: "normal"
		},
		legendCallback   : function ( chart ) {
			// console.log( "legendCallback" );
			let legendHtml = [];
			legendHtml.push( "<table>" );
			legendHtml.push( "<tr>" );
			for ( let i = 0; i < chart.data.datasets.length; i++ ) {
				legendHtml.push( "<td><div class=\"chart-legend\" style=\"background-color:" + chart.data.datasets[ i ].backgroundColor + "\"></div></td>" );
				if ( chart.data.datasets[ i ].label ) {
					legendHtml.push( "<td class=\"chart-legend-label-text\" onclick=\"updateDataset(event, " + "'" + chart.legend.legendItems[ i ].datasetIndex + "'" + ")\">" + chart.data.datasets[ i ].label + "</td>" );
				}
			}
			legendHtml.push( "</tr>" );
			legendHtml.push( "</table>" );
			return legendHtml.join( "" );
		},
		legend           : {
			display : true,
			position: "right",
			reverse : true,
			// 	legendCallback: function(chart) {
			// 		var text = [];
			// 		text.push('<ul class="' + chart.id + '-legend">');
			// 		for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
			// 			text.push('<li><span style="background-color:' + chart.data.datasets[0].backgroundColor[i] +
			// '">'); if (chart.data.labels[i]) { text.push(chart.data.labels[i]); } text.push('</span></li>'); }
			// text.push('</ul>'); return text.join(""); }, generateLabels: function(chart) { console.log(chart.data);
			// var text = []; text.push('<ul>'); for (var i=0; i<chart.data.datasets[0].data.length; i++) {
			// text.push('<li>'); text.push('<span style="background-color:' +
			// chart.data.datasets[0].backgroundColor[i] + '">' + chart.data.datasets[0].data[i] + '</span>'); if
			// (chart.data.labels[i]) { // text.push(chart.data.labels[i]); text.push('hello'); } text.push('</li>'); }
			// text.push('</ul>'); return text.join(""); },
			labels  : {
				//fontColor: 'rgb(255, 99, 132)'
				boxWidth: 20
			}
		},
		layout           : {
			padding: {
				left  : 20,
				top   : 0,
				right : 40,
				bottom: 20
			}
		},
		defaultFontFamily: "Roboto, sans-serif",
		bar              : {
			barThickness: 20
		},
		line             : {
			borderColor: "#F85F73"
		}
	}
} );

// console.log( 'env', process.env );

// Environment
export const PREDICTA_DEBUG           = ( process.env.PREDICTA_DEBUG && process.env.PREDICTA_DEBUG.toLowerCase() === "true" );
export const NODE_ENV                 = process.env.NODE_ENV;
export const PREDICTA_CLIENT_LOGGER   = process.env.PREDICTA_CLIENT_LOGGER;
export const PREDICTA_SERVICES_DOMAIN = process.env.PREDICTA_SERVICES_DOMAIN;
export const PREDICTA_AUTH            = process.env.PREDICTA_AUTH;

// Google Analytics
// export const GA_ACCOUNT_ID = '91095649';
export const GA_TRACKING_ID = process.env.PREDICTA_GA_TRACKING_ID;

// Administrator defaults
export const ADMIN_DEFAULT_CATEGORY_NAME  = "cars";
export const ADMIN_DEFAULT_CATEGORY_TITLE = "Automotive";
// export const ADMIN_DEFAULT_BRAND = 'BMW';
export const ADMIN_DEFAULT_BRAND_ID       = 953283339;
// Predicta user roles
export const ROLE_ADMINISTRATOR           = "Administrator";
export const ROLE_AUTHENTICATED           = "Authenticated";
export const ROLE_CREATE_USERS            = "Create Users";
export const ROLE_ANONYMOUS               = "Anonymous";
export const SELECT_ALL                   = "select all";

// Authentication Roles
export const PREDICTA_ADMIN     = "Predicta Admin";
export const PREDICTA_DEVELOPER = "Predicta Developer";
export const COMPANY_ADMIN      = "Company Admin";

// Chart Types
// WARNING: don't change these numbers, it will screw up Google Analytics. These need to be numbers and changing the
// number changes results in analytics.
export const CHART_TRENDS                           = 0;
export const CHART_LANDSCAPE                        = 1;
export const CHART_BRAND_COMPARISON                 = 2;
export const CHART_BRAND_COMPARISON_WHITESPACE      = 3;
export const CHART_INTRINSICS_COMPARISON            = 4;
export const CHART_INTRINSICS_COMPARISON_WHITESPACE = 5;
export const CHART_INTRINSICS_BY_PERIOD             = 6;
export const CHART_RADAR                            = 7;
export const CHART_SCATTERPLOT                      = 8;
export const CHART_SENTIMENTCOUNTS_BY_PERIOD        = 9;
export const CHART_POSITIVE_SENTIMENTCOUNTS_BY_PERIOD = 10;
export const CHART_NEGATIVE_SENTIMENTCOUNTS_BY_PERIOD = 11;
export const CHART_NEUTRAL_SENTIMENTCOUNTS_BY_PERIOD = 12;

// charts
export const CHART_SORT_BY_NAME                                = "CHART_SORT_BY_NAME";
export const CHART_SORT_BY_FREQUENCY                           = "CHART_SORT_BY_FREQUENCY";
export const CHART_SCALE_GLOBAL                                = "CHART_SCALE_GLOBAL";
export const CHART_SCALE_LOCAL                                 = "CHART_SCALE_LOCAL";
export const CHART_EVENT                                       = "CHART_EVENT";
export const CHART_UPDATE_SETTINGS                             = "CHART_UPDATE_SETTINGS";
export const GET_CHART_BRAND_COMPARISONS_DATA                  = "GET_CHART_BRAND_COMPARISONS_DATA";
export const GET_CHART_WHITESPACE_ANALYSIS_DATA                = "GET_CHART_WHITESPACE_ANALYSIS_DATA";
export const GET_INTRINSICS_BY_PERIOD                          = "GET_INTRINSICS_BY_PERIOD";
export const GET_INTRINSICS_BY_PERIOD_FOR_RADAR                = "GET_INTRINSICS_BY_PERIOD_FOR_RADAR";
export const GET_INTRINSICS_BY_PERIOD_FOR_TRENDS               = "GET_INTRINSICS_BY_PERIOD_FOR_TRENDS";
export const GET_PRODUCT_SENTIMENT_PRODUCT_BY_WEEK             = "GET_PRODUCT_SENTIMENT_PRODUCT_BY_WEEK";
export const GET_VISUALIZATION_DATA                            = "GET_VISUALIZATION_DATA";
export const PLOT_BGCOLOR                                      = "rgb(245, 245, 245)";
export const PLOT_PAPERCOLOR                                   = "rgb(255, 255, 255)";
export const PAPER_BGCOLOR                                     = "rgb(255, 255, 255)";
export const PRODUCTS_PER_PAGE                                 = 100;
export const SET_CHART_CONFIG                                  = "SET_CHART_CONFIG";
export const SET_CHARTS_SELECTION_TYPE                         = "SET_CHARTS_SELECTION_TYPE";
export const SET_COMPARISON_CHART_TYPE                         = "SET_COMPARISON_CHART_TYPE";
export const SET_INTRINSICS_BY_PERIOD_STACKED                  = "SET_INTRINSICS_BY_PERIOD_STACKED";
export const SET_INTRINSICS_CHART_TYPE                         = "SET_INTRINSICS_CHART_TYPE";
export const SET_INTRINSICS_BY_PERIOD_CHART_TYPE               = "SET_INTRINSICS_BY_PERIOD_CHART_TYPE";
export const SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE = "SET_INTRINSICS_BY_PERIOD_CHART_INTERPOLATION_TYPE";
export const SET_INTRINSICS_BY_PERIOD_DATE_RANGE               = "SET_INTRINSICS_BY_PERIOD_DATE_RANGE";
export const SET_INTRINSICS_BY_PERIOD_CHART_SCALE              = "SET_INTRINSICS_BY_PERIOD_CHART_SCALE";
export const SET_INTRINSICS_BY_PERIOD_CHART_SORT               = "SET_INTRINSICS_BY_PERIOD_CHART_SORT";
export const INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND          = "INTRINSICS_BY_PERIOD_INTRINSICS_BY_BRAND";
export const INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC          = "INTRINSICS_BY_PERIOD_BRANDS_BY_INTRINSIC";
export const SET_LANDSCAPE_CHART_TYPE                          = "SET_LANDSCAPE_CHART_TYPE";
export const SET_LANDSCAPE_CHART_VIEW                          = "SET_LANDSCAPE_CHART_VIEW";
export const SET_RADAR_CHART_DATES                             = "SET_RADAR_CHART_DATES";
export const SET_RADAR_CHART_PERIOD                            = "SET_RADAR_CHART_PERIOD";
export const SET_RADAR_CHART_SCALED                            = "SET_RADAR_CHART_SCALED";
export const SET_RADAR_CHART_STACKED                           = "SET_RADAR_CHART_STACKED";
export const SET_RADAR_COMPARISON_TYPE                         = "SET_RADAR_COMPARISON_TYPE";
export const SET_RADAR_CHART_TYPE                              = "SET_RADAR_CHART_TYPE";
export const SET_TIME_PERIOD_FOR_TRENDS                        = "SET_TIME_PERIOD_FOR_TRENDS";
export const SET_SELECTED_CHART                                = "SET_SELECTED_CHART";
export const SENTIMENTCOUNTS_BY_PERIOD_BRANDS_BY_INTRINSIC     = "SENTIMENTCOUNTS_BY_PERIOD_BRANDS_BY_INTRINSIC";


export const SET_INTRINSICS_GLOBAL_CUSTOM_TYPE                 = "SET_INTRINSICS_GLOBAL_CUSTOM_TYPE";


//scatter plot
export const GET_CHART_SCATTER_PLOT                            = "GET_CHART_SCATTER_PLOT";
//intrinsic charts
export const GET_CHART_INTRINSIC_COMPARISONS_DATA              = "GET_CHART_INTRINSIC_COMPARISONS_DATA";
export const GET_CHART_INTRINSIC_WHITESPACE_ANALYSIS_DATA      = "GET_CHART_INTRINSIC_WHITESPACE_ANALYSIS_DATA";

// begin: actions
export const FETCH_NAVDATA                          = "FETCH_NAVDATA";
export const FETCH_HOME_PAGE_DATA                   = "FETCH_HOME_PAGE_DATA";
export const SET_CATEGORY                           = "SET_CATEGORY";
export const SAGA_SET_CATEGORY                      = "SAGA_SET_CATEGORY";
export const SET_NAVIGATION_TYPE                    = "SET_NAVIGATION_TYPE";
export const SET_REFINE_BY_TYPE                     = "SET_REFINE_BY_TYPE";
export const GET_BRAND_NAMES                        = "GET_BRAND_NAMES";
export const SET_BRAND_NAMES                        = "SET_BRAND_NAMES";
export const BRAND_CLICKED                          = "BRAND_CLICKED";
export const INTRINSIC_CLICKED                      = "INTRINSIC_CLICKED";
export const GET_BRAND_DATA                         = "GET_BRAND_DATA";
export const GET_ALL_BRANDS_MAP                     = "GET_ALL_BRANDS_MAP";
export const FETCH_BRAND_SUMMARY                    = "FETCH_BRAND_SUMMARY";
export const GET_BRAND_INTRINSICS                   = "GET_BRAND_INTRINSICS";
export const SET_INTRINSICS_NAMES                   = "SET_INTRINSICS_NAMES";
export const SET_BRAND_SORT_TYPE                    = "SET_BRAND_SORT_TYPE";
export const SET_PRODUCT_SORT_TYPE                  = "SET_PRODUCT_SORT_TYPE";
export const SET_PRODUCT_THRESHOLD                  = "SET_PRODUCT_THRESHOLD";
export const SET_REVIEW_THRESHOLD                   = "SET_REVIEW_THRESHOLD";
export const FETCH_PRODUCTS                         = "FETCH_PRODUCTS";
export const FETCH_PRODUCT_JSON                     = "FETCH_PRODUCT_JSON";
export const FETCH_NEXT_PRODUCTS                    = "FETCH_NEXT_PRODUCTS";
export const GET_REVIEWS_FOR_INTRINSIC              = "GET_REVIEWS_FOR_INTRINSIC";
export const GET_REVIEWS_FOR_BRAND_INTRINISIC       = "GET_REVIEWS_FOR_BRAND_INTRINISIC";
export const GET_DATA_SOURCES_FOR_PRODUCT_INTRINSIC = "GET_DATA_SOURCES_FOR_PRODUCT_INTRINSIC";
export const GET_ALL_DATA_SOURCES_FOR_PRODUCT       = "GET_ALL_DATA_SOURCES_FOR_PRODUCT";
export const FETCH_USER_DATA                        = "FETCH_USER_DATA";
export const LOGIN                                  = "LOGIN";
export const LOGOUT                                 = "LOGOUT";
export const FETCH_USERS                            = "FETCH_USERS";

// Events

export const EVENTS_READ_ALL                       = "EVENTS_READ_ALL";
export const EVENT_CREATE                          = "EVENT_CREATE";
export const EVENT_UPDATE                          = "EVENT_UPDATE";
export const EVENT_DELETE                          = "EVENT_DELETE";
export const EVENT_EDIT                            = "EVENT_EDIT"; // initiate edit in ui
export const EVENT_END_EDIT                        = "EVENT_END_EDIT"; // initiate edit in ui
export const EVENT_LISTS                           = [ "brandIdList", "intrinsicIdList", "productIdList", "publicationLocationList" ];
export const EVENT_DEFAULT_COLOR                   = "#ABB8C3";
export const EVENT_IMAGE_SIZE                      = 200;
export const EVENT_GET_INTRINSICS_BY_PERIOD        = "EVENT_GET_INTRINSICS_BY_PERIOD";
export const EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS = "EVENT_CHART_VIEW_INTRINSICS_BY_BRANDS";
export const EVENT_CHART_VIEW_BRANDS_BY_INTRINSICS = "EVENT_CHART_VIEW_BRANDS_BY_INTRINSICS";
export const EVENT_CHART_VIEW_BRANDS_BY_ALL_INTRINSICS = "EVENT_CHART_VIEW_BRANDS_BY_ALL_INTRINSICS";


// Publications

export const PUBLICATION_READ_ALL = "PUBLICATION_READ_ALL";
export const PUBLICATION_READ     = "PUBLICATION_READ";
export const PUBLICATION_CREATE   = "PUBLICATION_CREATE";
export const PUBLICATION_UPDATE   = "PUBLICATION_UPDATE";
export const PUBLICATION_DELETE   = "PUBLICATION_DELETE";


// brands/intrinsics working sets
export const SET_WORKING_SETS = "SET_WORKING_SETS";

export const REGISTER                    = "REGISTER";
export const SET_USER_BRANDS_CONTROL     = "SET_USER_BRANDS_CONTROL";
export const SET_USER_INTRINSICS_CONTROL = "SET_USER_INTRINSICS_CONTROL";
export const SET_PREFERRED_BRANDS        = "SET_PREFERRED_BRANDS";
export const SET_PREFERRED_INTRINSICS    = "SET_PREFERRED_INTRINSICS";

export const GET_CHART_TOPICS = "GET_CHART_TOPICS";
export const UPDATE_TOPICS    = "UPDATE_TOPICS";
export const CREATE_TOPIC     = "CREATE_TOPIC";
export const DELETE_TOPIC     = "DELETE_TOPIC";
export const GET_TOPICS_SENTIMENT_COUNTS     = "GET_TOPICS_SENTIMENT_COUNTS";
export const GET_POSITIVE_TOPICS_SENTIMENT_COUNTS     = "GET_POSITIVE_TOPICS_SENTIMENT_COUNTS";
export const GET_NEGATIVE_TOPICS_SENTIMENT_COUNTS     = "GET_NEGATIVE_TOPICS_SENTIMENT_COUNTS";
export const GET_NEUTRAL_TOPICS_SENTIMENT_COUNTS     = "GET_NEUTRAL_TOPICS_SENTIMENT_COUNTS";
// action suffix
export const FULFILLED        = "_FULFILLED";
// end: actions
// begin: nav


export const MEDIA_UPLOAD_URL            = "https://auth.predicta.com/media/upload";
export const NAV_ITEM_DASHBOARD          = "Dashboard";
export const NAV_ITEM_TRENDS             = "Trends";
export const NAV_ITEM_BRANDS             = "Brands";
export const NAV_ITEM_PRODUCTS           = "Products";
export const NAV_ITEM_TOPICS             = "Intrinsics Editor";
export const NAV_ITEM_SETTINGS           = "Settings";
export const NAV_ITEM_EVENTS             = "Events";
export const NAV_ITEM_INTRINSICS_REPORTS = "Custom Intrinsics";
export const NAV_ITEM_GLOBAL_INTRINSICS_REPORTS = "Global Intrinsics";
export const NAV_ITEM_RADAR              = "Radar";
// export const NAV_ITEM_SOURCES = 'Sources';
export const NAV_ITEM_SIGN_OUT           = "Sign out";
// export const NAV_ITEM_SETTINGS = 'Settings';
export const NAV_ITEM_ADMIN              = "Manage users";

/** SupportBee **/

export const SUBMIT_SUPPORT_FORM            = "SUBMIT_SUPPORT_FORM";
export const NAV_ITEM_SUPPORT               = "Support";
export const NAV_ACTION_SUPPORT             = "NAV_ACTION_SUPPORT";
export const SUPPORTBEE_ENDPOINT            = "support/tickets";
export const SUPPORTBEE_FORWARDING_EMAIL_ID = 14497;
export const SUPPORTBEE_TOKEN               = "XMhDRAr5HBQ6RgrkmZJ8";

// end: nav
// begin: brand summary
export const BRAND_SUMMARY_BRANDS_SELECTED = "brands selected";
export const BRAND_SUMMARY_TOTAL_BRANDS    = "total brands";
export const BRAND_SUMMARY_TOTAL_PRODUCTS  = "total products";
export const BRAND_SUMMARY_TOTAL_SOURCES   = "total sources";
export const BRAND_SUMMARY_SUMMARY         = "Summary : ";
// end: brand summary
// begin: register
export const REGISTER_USERNAME                = "Username";
export const REGISTER_CATEGORIES              = "Select categories";
export const REGISTER_SELECT_DEFAULT_CATEGORY = "Select default category";
export const REGISTER_BRAND                   = "Select default brand";
// end: register
// begin: login
export const LOGIN_STATUS_LOGGED_IN  = "OK";
export const LOGIN_EMAIL             = "Email:";
export const LOGIN_PASSWORD          = "Password:";
export const LOGIN_KEEP_ME_LOGGED_IN = "Keep me logged in";
export const LOGIN_SUBMIT            = "Submit";
export const SET_LOGIN_INFO          = "SET_LOGIN_INFO";
// end: login
// begin: admin
export const SET_SELECTED_ADMIN_TAB   = "SET_SELECTED_ADMIN_TAB";
export const ADMIN_TAB_ADD_COMPANY    = "addcompany";
export const ADMIN_TAB_ADD_USER       = "adduser";
export const ADMIN_TAB_CONFIGURE_USER = "configureuser";
export const ADMIN_TAB_VIEW_USERS     = "viewusers";
export const ADMIN_UPDATE_USER        = "ADMIN_UPDATE_USER";
// end: admin

export const BRAND_SORT_TYPE_MAPPING = {
	"name"           : "brand",
	"rank"           : "score",
	"dataSourceCount": "source count"
};

//Topics
export const TOPICS_SET_SORT_ORDER            = "TOPICS_SET_SORT_ORDER";
export const TOPICS_SORT_ORDER_ENABLED_FIRST  = "TOPICS_SORT_ORDER_ENABLED_FIRST";
export const TOPICS_SORT_ORDER_DISABLED_FIRST = "TOPICS_SORT_ORDER_DISABLED_FIRST";


// Curation
export const CURATION_UPDATE_BRAND = "CURATION_UPDATE_BRAND";

// permissions

export const PERMISSIONS_CURATE_DATA       = "curateData";
export const PERMISSIONS_VIEW_JSON         = "readJson";
export const PERMISSIONS_UPDATE_USER_DATA  = "updateUserData";
export const PERMISSIONS_VIEW_DATA_SOURCES = "readDataSources";
export const PERMISSIONS_UPDATE_TOPIC_DATA = "updateTopicData";


/** Password **/
export const AWS_USER_LOST_PASSWORD                = "AWS_USER_LOST_PASSWORD";
export const AWS_USER_RESET_PASSWORD               = "AWS_USER_RESET_PASSWORD";
export const AWS_USER_CHANGE_PASSWORD              = "AWS_USER_CHANGE_PASSWORD";
export const AWS_USER_RESET_CHANGE_PASSWORD_STATUS = "AWS_USER_RESET_CHANGE_PASSWORD_STATUS";
export const AWS_USER_RESET_LOST_PASSWORD_STATUS   = "AWS_USER_RESET_LOST_PASSWORD_STATUS";


// BRAND/PRODUCT STATUSES
export const UNKNOWN  = 0;
export const VERIFIED = 1;
export const BAD      = -1;

export const DATE_RANGE_1_MONTH  = "DATE_RANGE_1_MONTH";
export const DATE_RANGE_3_MONTHS = "DATE_RANGE_3_MONTHS";
export const DATE_RANGE_6_MONTHS = "DATE_RANGE_6_MONTHS";
export const DATE_RANGE_YTD      = "DATE_RANGE_YTD";
export const DATE_RANGE_1_YEAR   = "DATE_RANGE_1_YEAR";
export const DATE_RANGE_ALL      = "DATE_RANGE_ALL";

export const COLORS_SENTIMENT = [ "rgb(230,240,220)", "rgb(186,228,188)", "rgb(123,204,196)", "rgb(67,162,202)", "rgb(8,104,172)" ];

//http://colorbrewer2.org/?type=qualitative&scheme=Pastel1&n=100
export const markerColors = [ "#ab6267", "#71a1dc", "#1bcb78", "#866609", "#2f65d0", "#9024a2", "#115e41", "#a53460", "#3edaa1", "#86a061", "#115e41", "#b26145", "#1eae35", "#e9807c", "#3f81c2", "#5ab220", "#bbbc81", "#9d6fb0", "#daa969", "#ec314e", "#7e3e53", "#b92967", "#115e41", "#ae2779", "#306a3c", "#ac4db9", "#f3bd68", "#f1a970", "#226a4d", "#4cd2c3", "#d98e01", "#48d2f2", "#696aa1", "#b57eb4", "#eb67bc", "#3db366", "#526fb4", "#e86b7d", "#47a2f7", "#5e8934", "#ccb781", "#90a9f4", "#f287d0", "#0f5eb0", "#e95fa4", "#d3678c", "#2c7ea9", "#115e41", "#91b84b", "#bc5857", "#115e41", "#79c1ef", "#8a40b0", "#c0c145", "#d7487f", "#2b6abe", "#f26e65", "#e37ac3", "#516615", "#8f81d2", "#e28f82", "#8b436d", "#c09669", "#66b64f", "#cb66ea", "#92945b", "#bd8f50", "#b9c024", "#115e41", "#6764ce", "#115e41", "#115e41", "#115e41", "#725090", "#a07537", "#e34429", "#7785c2", "#ce5ac9", "#cc76df", "#ca4715", "#a26c1b", "#60a130", "#41beca", "#a5ba6d", "#647829", "#235e31", "#c17b14", "#6676d3", "#9fa8e1", "#d82f8a", "#ec84b6", "#5bc495", "#115e41", "#967044", "#cdaf54", "#445a06", "#a95c9a", "#eb70d5", "#317921", "#e74c53", "#2ca559", "#3c4dbb", "#467dd3", "#9a5cdd", "#8aa11c", "#489dcf", "#bf7b30", "#cd4c35", "#54c879", "#b5753e", "#a2272e", "#7dcf55", "#db9340", "#316ea7", "#115e41", "#f63c85", "#ba1a20", "#15974d", "#115e41", "#589e7e", "#efb64c", "#867af4", "#7c46c9", "#ce40b0", "#9b7b23", "#115e41", "#608d1f", "#d8a238", "#e2a822", "#71743d", "#af6ab8", "#115e41", "#bd5089", "#de8066", "#9a5c0d", "#277a35", "#dd8f94", "#9a3171", "#73ae22", "#cb6c42", "#a42d14", "#415a1f", "#b23946", "#da476f", "#914947", "#5794d7", "#115e41", "#8a4321", "#a46fe0", "#45adec", "#b0953a", "#495eb7", "#df2a69", "#5073f7", "#2ba198", "#95394a", "#e997d7", "#f89b6a", "#a54339", "#57692f", "#c0691e", "#7e54bf", "#745a2d", "#c2bc64", "#d8bd75", "#8169bb", "#cd65ae", "#dc915b", "#9dac45", "#32c459", "#2baad3", "#f7855e", "#4a5589", "#846625", "#115e41", "#5d84f4", "#7b4698", "#359721", "#bf86ea", "#bf8f3b", "#927b36", "#56db66", "#44701b", "#dcb838", "#f39450", "#e17138", "#5f9a56", "#355799", "#eea240", "#984663", "#b49c55", "#d0545e", "#bb648e", "#81c49b", "#2580fe", "#1f814d", "#ba881a", "#758c45", "#c85047", "#2a9739", "#639e6c", "#757429", "#e85f1c", "#8574b1", "#eb78ee", "#ef8d14", "#bb76f4", "#115e41", "#d56b58", "#46a26c", "#73b46c", "#e22959", "#dda955", "#d474cd", "#f7977b", "#9e65c3", "#8390f0", "#bfb226", "#7b95de", "#ed556b", "#c71f39", "#f37e2f", "#ee94b0", "#248fe1", "#d42273", "#c32311", "#c62f4d", "#9c3190", "#f18fea", "#5756a0", "#1aac72", "#3e7030", "#f75b9b", "#437d4e", "#43c88b", "#e18af4", "#bc5768", "#7e7a17", "#f258c6", "#afa746", "#115e41", "#f0a224", "#d89bc8", "#f15d82", "#b6685d", "#a794d3", "#ab4c0e", "#b150a1", "#a4880e", "#dc803d", "#c1a22f", "#a7c522", "#90cd7a", "#a03cbf", "#f4a95c", "#bc1794", "#7eab53", "#d190de", "#9ec641", "#5a46a8", "#f46e53", "#884d84", "#e5808e", "#ccabf0", "#115e41", "#c88963", "#6e56d0", "#915620", "#e5862d", "#bc2757", "#cc7dbb", "#965d39", "#ca2d2b", "#db6a1a", "#585a16", "#8e7c49", "#765113", "#a83250", "#60c765", "#969448", "#ee663a", "#115e41", "#2f7b63", "#ecb489", "#e94c42", "#518342", "#fb5a3b", "#a76a8f", "#9382e9", "#ae4d28", "#d2439c", "#245ada", "#219571", "#a09826", "#695711", "#6e7f15", "#4f90f2", "#4f9844", "#ab98ed", "#115e41" ];

//http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12
export const markerColors2 = [ "rgb(166,206,227)", "rgb(31,120,180)", "rgb(178,223,138)", "rgb(51,160,44)", "rgb(251,154,153)", "rgb(227,26,28)", "rgb(253,191,111)", "rgb(255,127,0)", "rgb(202,178,214)", "rgb(106,61,154)", "rgb(255,255,153)", "rgb(177,89,40)" ];

export const markerColors3 = [ "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f", "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5" ];

export const markerColors4 = [ "rgb(255,127,0)", "rgb(202,178,214)", "rgb(106,61,154)", "rgb(255,255,153)", "rgb(178,223,138)", "rgb(166,206,227)", "rgb(51,160,44)", "rgb(227,26,28)", "rgb(251,154,153)", "rgb(31,120,180)", "rgb(253,191,111)" ];

export const markerColors5 = [ "#426fb0",
	"#da721d",
	"#4cacdb",
	"#914665",
	"#e95b52",
	"#c4bb33",
	"#5dbf8c",
	"#e24492",
	"#8563ab",
	"#af3879",
	"#d46161",
	"#e38bab",
	"#a85542",
	"#ab752f",
	"#694ca5",
	"#d96783",
	"#92b466",
	"#ab6ae1",
	"#e16ece",
	"#775c1a",
	"#a4491b",
	"#a34551",
	"#36815b",
	"#cca745",
	"#458932",
	"#ca8dd6",
	"#e05227",
	"#936037",
	"#eaa836",
	"#8e813b",
	"#677fe6",
	"#c58619",
	"#8e9de0",
	"#a63ba9",
	"#d6a075",
	"#d36e3a",
	"#db355d",
	"#da9f63",
	"#bfb46d",
	"#ed9457",
	"#52c25c",
	"#a05d8f",
	"#40c0bc",
	"#85b937",
	"#5d6d29",
	"#ba2f28",
	"#95962b",
	"#e88c79",
	"#535bd3",
	"#ee8d27" ];
export const markerColors6 =["#458932","#e95b52","#426fb0"];

// produced by makeColors
export const colors = [ "rgba(64,170,206,0.5)", "rgba(244,243,151,0.5)", "rgba(66,214,157,0.5)", "rgba(210,252,174,0.5)", "rgba(244,36,102,0.5)", "rgba(209,143,62,0.5)", "rgba(255,196,206,0.5)", "rgba(20,107,183,0.5)", "rgba(186,129,232,0.5)", "rgba(176,211,80,0.5)", "rgba(221,106,139,0.5)", "rgba(249,69,219,0.5)", "rgba(158,247,167,0.5)", "rgba(36,91,173,0.5)", "rgba(239,122,130,0.5)", "rgba(62,155,23,0.5)", "rgba(19,211,163,0.5)", "rgba(195,122,221,0.5)", "rgba(123,96,255,0.5)", "rgba(153,255,212,0.5)", "rgba(150,216,255,0.5)", "rgba(25,80,198,0.5)", "rgba(247,140,165,0.5)", "rgba(237,199,252,0.5)", "rgba(117,141,221,0.5)", "rgba(235,142,242,0.5)", "rgba(126,234,187,0.5)", "rgba(120,76,186,0.5)", "rgba(232,197,136,0.5)", "rgba(145,226,131,0.5)", "rgba(185,232,99,0.5)", "rgba(168,132,214,0.5)", "rgba(91,234,103,0.5)", "rgba(216,150,255,0.5)", "rgba(110,216,128,0.5)", "rgba(168,201,237,0.5)", "rgba(74,226,85,0.5)", "rgba(151,24,201,0.5)", "rgba(69,30,168,0.5)", "rgba(173,63,29,0.5)", "rgba(242,226,147,0.5)", "rgba(252,214,181,0.5)", "rgba(244,196,107,0.5)", "rgba(110,221,190,0.5)", "rgba(189,196,0,0.5)", "rgba(68,226,91,0.5)", "rgba(234,159,233,0.5)", "rgba(255,216,173,0.5)", "rgba(91,135,211,0.5)", "rgba(0,135,24,0.5)", "rgba(255,167,5,0.5)", "rgba(252,252,113,0.5)", "rgba(118,223,237,0.5)", "rgba(234,182,70,0.5)", "rgba(77,26,147,0.5)", "rgba(245,255,175,0.5)", "rgba(36,125,226,0.5)", "rgba(188,74,35,0.5)", "rgba(186,237,255,0.5)", "rgba(166,219,244,0.5)", "rgba(44,204,121,0.5)", "rgba(98,224,209,0.5)", "rgba(237,99,202,0.5)", "rgba(193,229,64,0.5)", "rgba(36,178,14,0.5)", "rgba(140,127,226,0.5)", "rgba(119,239,229,0.5)", "rgba(34,170,50,0.5)", "rgba(221,215,95,0.5)", "rgba(84,216,128,0.5)", "rgba(15,244,7,0.5)", "rgba(152,42,221,0.5)", "rgba(57,37,145,0.5)", "rgba(178,48,61,0.5)", "rgba(76,44,170,0.5)", "rgba(117,179,206,0.5)", "rgba(252,248,181,0.5)", "rgba(2,132,69,0.5)", "rgba(239,216,103,0.5)", "rgba(143,237,97,0.5)", "rgba(2,39,226,0.5)", "rgba(121,242,155,0.5)", "rgba(147,80,201,0.5)", "rgba(242,140,218,0.5)", "rgba(4,17,117,0.5)", "rgba(65,92,175,0.5)", "rgba(123,224,217,0.5)", "rgba(252,220,151,0.5)", "rgba(137,244,208,0.5)", "rgba(225,122,226,0.5)", "rgba(95,84,188,0.5)", "rgba(86,206,82,0.5)", "rgba(217,116,224,0.5)", "rgba(247,81,230,0.5)", "rgba(40,122,255,0.5)", "rgba(13,168,62,0.5)", "rgba(165,41,62,0.5)", "rgba(152,249,228,0.5)", "rgba(209,2,119,0.5)", "rgba(171,255,147,0.5)", "rgba(132,237,144,0.5)", "rgba(36,216,96,0.5)", "rgba(37,59,186,0.5)", "rgba(164,183,249,0.5)", "rgba(252,171,10,0.5)", "rgba(100,157,196,0.5)", "rgba(252,22,26,0.5)", "rgba(237,137,174,0.5)", "rgba(239,179,174,0.5)", "rgba(219,119,4,0.5)", "rgba(108,219,43,0.5)", "rgba(21,59,142,0.5)", "rgba(226,119,86,0.5)", "rgba(237,37,54,0.5)", "rgba(239,104,7,0.5)", "rgba(166,125,224,0.5)", "rgba(127,244,160,0.5)", "rgba(183,55,78,0.5)", "rgba(204,20,164,0.5)", "rgba(186,40,24,0.5)", "rgba(173,221,106,0.5)", "rgba(146,252,85,0.5)", "rgba(79,151,198,0.5)", "rgba(204,22,34,0.5)", "rgba(14,225,244,0.5)", "rgba(96,252,88,0.5)", "rgba(80,224,85,0.5)", "rgba(209,64,120,0.5)", "rgba(232,16,163,0.5)", "rgba(78,109,232,0.5)", "rgba(239,119,185,0.5)", "rgba(182,252,161,0.5)", "rgba(239,201,88,0.5)", "rgba(211,151,61,0.5)", "rgba(125,237,78,0.5)", "rgba(51,206,188,0.5)", "rgba(252,149,133,0.5)", "rgba(12,178,65,0.5)", "rgba(123,247,181,0.5)", "rgba(93,229,2,0.5)", "rgba(201,137,18,0.5)", "rgba(232,58,110,0.5)", "rgba(239,134,204,0.5)", "rgba(41,232,178,0.5)", "rgba(239,233,122,0.5)", "rgba(87,18,234,0.5)", "rgba(89,234,152,0.5)", "rgba(249,236,162,0.5)", "rgba(243,175,255,0.5)", "rgba(242,160,29,0.5)", "rgba(24,186,56,0.5)", "rgba(29,183,109,0.5)", "rgba(23,38,168,0.5)", "rgba(237,99,177,0.5)", "rgba(7,158,133,0.5)", "rgba(132,249,208,0.5)", "rgba(123,242,222,0.5)", "rgba(196,155,19,0.5)", "rgba(3,155,140,0.5)", "rgba(242,36,9,0.5)", "rgba(231,87,242,0.5)", "rgba(196,188,244,0.5)", "rgba(155,242,221,0.5)", "rgba(212,33,239,0.5)", "rgba(163,247,173,0.5)", "rgba(252,158,80,0.5)", "rgba(164,125,219,0.5)", "rgba(184,191,59,0.5)", "rgba(206,71,30,0.5)", "rgba(169,252,248,0.5)", "rgba(224,35,149,0.5)", "rgba(145,135,221,0.5)", "rgba(160,30,47,0.5)", "rgba(59,20,168,0.5)", "rgba(229,124,103,0.5)", "rgba(203,186,244,0.5)", "rgba(10,27,181,0.5)", "rgba(43,16,117,0.5)", "rgba(18,234,97,0.5)", "rgba(4,8,247,0.5)", "rgba(239,158,170,0.5)", "rgba(29,63,145,0.5)", "rgba(194,219,252,0.5)", "rgba(213,199,252,0.5)", "rgba(71,39,153,0.5)", "rgba(158,130,229,0.5)", "rgba(152,232,136,0.5)", "rgba(216,149,23,0.5)", "rgba(34,232,47,0.5)", "rgba(77,209,125,0.5)", "rgba(194,155,221,0.5)", "rgba(239,0,115,0.5)", "rgba(24,75,226,0.5)", "rgba(219,130,237,0.5)", "rgba(108,187,247,0.5)", "rgba(224,89,175,0.5)", "rgba(249,192,221,0.5)", "rgba(165,62,36,0.5)", "rgba(123,237,216,0.5)", "rgba(156,14,204,0.5)", "rgba(108,23,145,0.5)", "rgba(127,139,224,0.5)", "rgba(232,222,113,0.5)", "rgba(239,244,159,0.5)", "rgba(98,229,155,0.5)", "rgba(70,48,232,0.5)", "rgba(105,123,211,0.5)", "rgba(208,229,137,0.5)", "rgba(229,2,43,0.5)", "rgba(249,161,149,0.5)", "rgba(29,35,147,0.5)", "rgba(156,197,244,0.5)", "rgba(64,170,25,0.5)", "rgba(128,156,247,0.5)", "rgba(35,57,163,0.5)", "rgba(17,155,65,0.5)", "rgba(180,15,188,0.5)", "rgba(147,83,204,0.5)", "rgba(98,67,198,0.5)", "rgba(190,179,239,0.5)", "rgba(117,255,222,0.5)", "rgba(249,208,189,0.5)", "rgba(252,155,37,0.5)", "rgba(209,89,127,0.5)", "rgba(244,95,41,0.5)", "rgba(151,165,19,0.5)", "rgba(66,221,190,0.5)", "rgba(244,139,214,0.5)", "rgba(204,69,211,0.5)", "rgba(216,77,226,0.5)", "rgba(58,196,79,0.5)", "rgba(249,134,136,0.5)", "rgba(216,71,209,0.5)", "rgba(113,188,37,0.5)", "rgba(102,255,153,0.5)", "rgba(222,64,247,0.5)", "rgba(249,245,107,0.5)", "rgba(216,182,78,0.5)", "rgba(120,232,211,0.5)", "rgba(105,120,234,0.5)", "rgba(229,239,151,0.5)", "rgba(158,23,11,0.5)", "rgba(226,221,108,0.5)", "rgba(237,26,61,0.5)", "rgba(221,124,130,0.5)", "rgba(160,102,201,0.5)", "rgba(116,159,219,0.5)", "rgba(95,222,232,0.5)", "rgba(29,211,32,0.5)", "rgba(123,198,25,0.5)", "rgba(216,155,97,0.5)", "rgba(221,86,142,0.5)", "rgba(239,216,7,0.5)", "rgba(82,43,209,0.5)", "rgba(231,75,242,0.5)", "rgba(249,248,172,0.5)", "rgba(232,170,148,0.5)", "rgba(176,242,123,0.5)", "rgba(232,166,109,0.5)", "rgba(84,221,68,0.5)", "rgba(247,175,238,0.5)", "rgba(82,187,206,0.5)", "rgba(234,79,188,0.5)", "rgba(78,252,159,0.5)", "rgba(209,171,2,0.5)", "rgba(252,199,240,0.5)", "rgba(137,237,200,0.5)", "rgba(144,186,244,0.5)", "rgba(127,197,219,0.5)", "rgba(247,121,232,0.5)", "rgba(38,135,204,0.5)", "rgba(252,126,100,0.5)", "rgba(176,244,144,0.5)", "rgba(174,196,252,0.5)", "rgba(77,14,135,0.5)", "rgba(9,95,119,0.5)", "rgba(237,26,212,0.5)", "rgba(238,255,91,0.5)", "rgba(168,247,165,0.5)", "rgba(213,237,37,0.5)", "rgba(247,163,244,0.5)", "rgba(216,10,124,0.5)", "rgba(27,19,109,0.5)", "rgba(160,27,47,0.5)", "rgba(50,91,163,0.5)", "rgba(148,239,157,0.5)", "rgba(242,82,127,0.5)", "rgba(226,188,255,0.5)", "rgba(123,149,237,0.5)", "rgba(255,142,245,0.5)", "rgba(40,122,237,0.5)", "rgba(252,233,181,0.5)", "rgba(123,110,209,0.5)", "rgba(166,207,234,0.5)", "rgba(249,226,192,0.5)", "rgba(219,54,172,0.5)", "rgba(234,157,150,0.5)", "rgba(239,190,158,0.5)", "rgba(158,239,127,0.5)", "rgba(63,164,252,0.5)" ];
