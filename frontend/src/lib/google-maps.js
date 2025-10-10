/**
 * @fileoverview A comprehensive service for interacting with various Google Maps APIs.
 * This module provides a unified interface for geocoding, places search, directions,
 * distance calculations, and more Google Maps Platform services.
 *
 * @module GoogleMapsService
 * @requires axios
 * @requires dotenv
 * @requires prop-types
 * @requires @google-cloud/firestore
 */

import axios from "axios";
import dotenv from "dotenv";
import PropTypes from "prop-types";

dotenv.config();

/**
 * PropTypes definitions for data structures
 */
const PropTypesDefinitions = {
	GeocodingResult: PropTypes.shape({
		formatted_address: PropTypes.string.isRequired,
		geometry: PropTypes.shape({
			location: PropTypes.shape({
				lat: PropTypes.number.isRequired,
				lng: PropTypes.number.isRequired,
			}).isRequired,
		}).isRequired,
		place_id: PropTypes.string.isRequired,
	}),

	PlaceSearchResult: PropTypes.shape({
		name: PropTypes.string.isRequired,
		formatted_address: PropTypes.string.isRequired,
		place_id: PropTypes.string.isRequired,
		geometry: PropTypes.shape({
			location: PropTypes.shape({
				lat: PropTypes.number.isRequired,
				lng: PropTypes.number.isRequired,
			}).isRequired,
		}).isRequired,
	}),

	PlaceDetails: PropTypes.shape({
		name: PropTypes.string.isRequired,
		formatted_phone_number: PropTypes.string,
		website: PropTypes.string,
		opening_hours: PropTypes.shape({
			weekday_text: PropTypes.arrayOf(PropTypes.string),
			open_now: PropTypes.bool,
		}),
	}),

	DistanceMatrixResult: PropTypes.shape({
		origin_addresses: PropTypes.arrayOf(PropTypes.string).isRequired,
		destination_addresses: PropTypes.arrayOf(PropTypes.string).isRequired,
		rows: PropTypes.arrayOf(
			PropTypes.shape({
				elements: PropTypes.arrayOf(
					PropTypes.shape({
						distance: PropTypes.shape({
							text: PropTypes.string.isRequired,
							value: PropTypes.number.isRequired,
						}).isRequired,
						duration: PropTypes.shape({
							text: PropTypes.string.isRequired,
							value: PropTypes.number.isRequired,
						}).isRequired,
						status: PropTypes.string.isRequired,
					}),
				).isRequired,
			}),
		).isRequired,
		status: PropTypes.string.isRequired,
	}),

	DirectionsResult: PropTypes.shape({
		routes: PropTypes.arrayOf(
			PropTypes.shape({
				summary: PropTypes.string.isRequired,
				legs: PropTypes.arrayOf(
					PropTypes.shape({
						distance: PropTypes.shape({
							text: PropTypes.string.isRequired,
							value: PropTypes.number.isRequired,
						}).isRequired,
						duration: PropTypes.shape({
							text: PropTypes.string.isRequired,
							value: PropTypes.number.isRequired,
						}).isRequired,
						steps: PropTypes.arrayOf(
							PropTypes.shape({
								html_instructions: PropTypes.string.isRequired,
								distance: PropTypes.shape({
									text: PropTypes.string.isRequired,
									value: PropTypes.number.isRequired,
								}).isRequired,
								duration: PropTypes.shape({
									text: PropTypes.string.isRequired,
									value: PropTypes.number.isRequired,
								}).isRequired,
							}),
						).isRequired,
					}),
				).isRequired,
			}),
		).isRequired,
		status: PropTypes.string.isRequired,
	}),

	AutocompletePrediction: PropTypes.shape({
		description: PropTypes.string.isRequired,
		place_id: PropTypes.string.isRequired,
		structured_formatting: PropTypes.shape({
			main_text: PropTypes.string.isRequired,
			secondary_text: PropTypes.string.isRequired,
		}).isRequired,
		terms: PropTypes.arrayOf(
			PropTypes.shape({
				offset: PropTypes.number.isRequired,
				value: PropTypes.string.isRequired,
			}),
		).isRequired,
		types: PropTypes.arrayOf(PropTypes.string).isRequired,
	}),

	GeolocationResult: PropTypes.shape({
		location: PropTypes.shape({
			lat: PropTypes.number.isRequired,
			lng: PropTypes.number.isRequired,
		}).isRequired,
		accuracy: PropTypes.number.isRequired,
	}),

	StreetViewResult: PropTypes.shape({
		status: PropTypes.string.isRequired,
		copyright: PropTypes.string,
		date: PropTypes.string,
		location: PropTypes.shape({
			lat: PropTypes.number.isRequired,
			lng: PropTypes.number.isRequired,
		}),
		pano_id: PropTypes.string,
	}),

	ElevationResult: PropTypes.shape({
		elevation: PropTypes.number.isRequired,
		location: PropTypes.shape({
			lat: PropTypes.number.isRequired,
			lng: PropTypes.number.isRequired,
		}).isRequired,
		resolution: PropTypes.number.isRequired,
	}),

	TimeZoneResult: PropTypes.shape({
		dstOffset: PropTypes.number.isRequired,
		rawOffset: PropTypes.number.isRequired,
		status: PropTypes.string.isRequired,
		timeZoneId: PropTypes.string.isRequired,
		timeZoneName: PropTypes.string.isRequired,
	}),

	LocationCoords: PropTypes.shape({
		lat: PropTypes.number.isRequired,
		lng: PropTypes.number.isRequired,
	}),
};

/**
 * Validates data against PropTypes definition
 */
const validatePropTypes = (data, propTypeDefinition, componentName) => {
	if (process.env.NODE_ENV !== "production") {
		PropTypes.checkPropTypes(
			{ data: propTypeDefinition },
			{ data },
			"prop",
			componentName,
		);
	}
	return data;
};

/**
 * A comprehensive service class for interacting with Google Maps Platform APIs.
 */
class GoogleMapsService {
	constructor(apiKey) {
		if (!apiKey) {
			throw new Error("Google Maps API key is required");
		}
		this.apiKey = apiKey;
		this.geocodingBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
		this.placesBaseUrl =
			"https://maps.googleapis.com/maps/api/place/textsearch/json";
		this.placeDetailsBaseUrl =
			"https://maps.googleapis.com/maps/api/place/details/json";
		this.nearbySearchBaseUrl =
			"https://maps.googleapis.com/maps/api/place/nearbysearch/json";
		this.distanceMatrixBaseUrl =
			"https://maps.googleapis.com/maps/api/distancematrix/json";
		this.directionsBaseUrl =
			"https://maps.googleapis.com/maps/api/directions/json";
		this.placesAutocompleteBaseUrl =
			"https://maps.googleapis.com/maps/api/place/autocomplete/json";
		this.geolocationBaseUrl =
			"https://www.googleapis.com/geolocation/v1/geolocate";
		this.streetViewBaseUrl = "https://maps.googleapis.com/maps/api/streetview";
		this.streetViewMetadataBaseUrl =
			"https://maps.googleapis.com/maps/api/streetview/metadata";
		this.elevationBaseUrl =
			"https://maps.googleapis.com/maps/api/elevation/json";
		this.timeZoneBaseUrl = "https://maps.googleapis.com/maps/api/timezone/json";
	}

	async geocodeAddress(address) {
		try {
			const response = await axios.get(this.geocodingBaseUrl, {
				params: {
					address,
					key: this.apiKey,
				},
			});

			if (response.data.status !== "OK") {
				console.error(`Geocoding failed with status: ${response.data.status}`);
				return null;
			}

			const result = response.data.results?.[0] || null;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.GeocodingResult,
					"geocodeAddress",
				);
			}
			return result;
		} catch (error) {
			console.error("Geocoding Error:", error);
			throw new Error(`Failed to geocode address: ${error.message}`);
		}
	}

	async searchPlaces(query) {
		try {
			const response = await axios.get(this.placesBaseUrl, {
				params: {
					query,
					key: this.apiKey,
				},
			});

			if (response.data.status !== "OK") {
				console.error(
					`Places search failed with status: ${response.data.status}`,
				);
				return null;
			}

			const result = response.data.results?.[0] || null;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.PlaceSearchResult,
					"searchPlaces",
				);
			}
			return result;
		} catch (error) {
			console.error("Places Search Error:", error);
			throw new Error(`Failed to search places: ${error.message}`);
		}
	}

	async getPlaceDetails(coordinates) {
		try {
			const nearbyUrl = new URL(this.nearbySearchBaseUrl);
			nearbyUrl.searchParams.append(
				"location",
				`${coordinates.latitude},${coordinates.longitude}`,
			);
			nearbyUrl.searchParams.append("radius", "50");
			nearbyUrl.searchParams.append("key", this.apiKey);

			const nearbyResponse = await fetch(nearbyUrl.toString());
			const nearbyData = await nearbyResponse.json();

			if (nearbyData.status !== "OK" || !nearbyData.results?.length) {
				console.log("No nearby places found");
				return null;
			}

			const placeId = nearbyData.results[0].place_id;
			const detailsUrl = new URL(this.placeDetailsBaseUrl);
			detailsUrl.searchParams.append("place_id", placeId);
			detailsUrl.searchParams.append(
				"fields",
				"name,formatted_phone_number,website,opening_hours",
			);
			detailsUrl.searchParams.append("key", this.apiKey);

			const detailsResponse = await fetch(detailsUrl.toString());
			const detailsData = await detailsResponse.json();

			if (detailsData.status !== "OK") {
				console.error(
					`Place details failed with status: ${detailsData.status}`,
				);
				return null;
			}

			const result = detailsData.result;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.PlaceDetails,
					"getPlaceDetails",
				);
			}
			return result;
		} catch (error) {
			console.error("Place details error:", error);
			return null;
		}
	}

	async getDistanceMatrix(origins, destinations, options = {}) {
		try {
			const originsArray = Array.isArray(origins) ? origins : [origins];
			const destinationsArray = Array.isArray(destinations)
				? destinations
				: [destinations];

			const originsStr = originsArray
				.map((origin) => {
					if (typeof origin === "string") return origin;
					return `${origin.lat},${origin.lng}`;
				})
				.join("|");

			const destinationsStr = destinationsArray
				.map((destination) => {
					if (typeof destination === "string") return destination;
					return `${destination.lat},${destination.lng}`;
				})
				.join("|");

			const response = await axios.get(this.distanceMatrixBaseUrl, {
				params: {
					origins: originsStr,
					destinations: destinationsStr,
					mode: options.mode || "driving",
					avoid: options.avoid,
					units: options.units || "metric",
					departure_time: options.departure_time,
					traffic_model: options.traffic_model,
					key: this.apiKey,
				},
			});

			if (response.data.status !== "OK") {
				console.error(
					`Distance Matrix API failed with status: ${response.data.status}`,
				);
				return null;
			}

			const result = response.data;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.DistanceMatrixResult,
					"getDistanceMatrix",
				);
			}
			return result;
		} catch (error) {
			console.error("Distance Matrix API Error:", error);
			throw new Error(`Failed to get distance matrix: ${error.message}`);
		}
	}

	async getDirections(origin, destination, options = {}) {
		try {
			const originStr =
				typeof origin === "string" ? origin : `${origin.lat},${origin.lng}`;
			const destinationStr =
				typeof destination === "string"
					? destination
					: `${destination.lat},${destination.lng}`;

			let waypointsStr;
			if (options.waypoints && options.waypoints.length > 0) {
				waypointsStr = options.waypoints
					.map((wp) => {
						if (typeof wp === "string") return wp;
						return `${wp.lat},${wp.lng}`;
					})
					.join("|");
			}

			const response = await axios.get(this.directionsBaseUrl, {
				params: {
					origin: originStr,
					destination: destinationStr,
					waypoints: waypointsStr,
					mode: options.mode || "driving",
					avoid: options.avoid,
					units: options.units || "metric",
					departure_time: options.departure_time,
					traffic_model: options.traffic_model,
					alternatives: options.alternatives,
					key: this.apiKey,
				},
			});

			if (response.data.status !== "OK") {
				console.error(
					`Directions API failed with status: ${response.data.status}`,
				);
				return null;
			}

			const result = response.data;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.DirectionsResult,
					"getDirections",
				);
			}
			return result;
		} catch (error) {
			console.error("Directions API Error:", error);
			throw new Error(`Failed to get directions: ${error.message}`);
		}
	}

	getMapsJavaScriptTag(options = {}) {
		const libraries = options.libraries
			? `&libraries=${options.libraries.join(",")}`
			: "";
		const callback = options.callback ? `&callback=${options.callback}` : "";
		const version = options.version ? `&v=${options.version}` : "";
		const language = options.language ? `&language=${options.language}` : "";
		const region = options.region ? `&region=${options.region}` : "";

		return `<script src="https://maps.googleapis.com/maps/api/js?key=${this.apiKey}${libraries}${callback}${version}${language}${region}" async defer></script>`;
	}

	async getPlacesAutocomplete(input, options = {}) {
		try {
			let locationStr;
			if (options.location) {
				locationStr = `${options.location.lat},${options.location.lng}`;
			}

			let componentsStr;
			if (options.components) {
				componentsStr = Object.entries(options.components)
					.map(([key, value]) => `${key}:${value}`)
					.join("|");
			}

			const response = await axios.get(this.placesAutocompleteBaseUrl, {
				params: {
					input,
					sessiontoken: options.sessiontoken,
					offset: options.offset,
					location: locationStr,
					radius: options.radius,
					types: options.types,
					components: componentsStr,
					strictbounds: options.strictbounds,
					language: options.language,
					key: this.apiKey,
				},
			});

			if (response.data.status !== "OK") {
				console.error(
					`Places Autocomplete API failed with status: ${response.data.status}`,
				);
				return null;
			}

			const results = response.data.predictions;
			if (results && results.length > 0) {
				results.forEach((result, index) => {
					validatePropTypes(
						result,
						PropTypesDefinitions.AutocompletePrediction,
						`getPlacesAutocomplete[${index}]`,
					);
				});
			}
			return results;
		} catch (error) {
			console.error("Places Autocomplete API Error:", error);
			throw new Error(
				`Failed to get autocomplete predictions: ${error.message}`,
			);
		}
	}

	async getCurrentLocation(options = {}) {
		try {
			const payload = {};

			if (options.considerIp !== undefined) {
				payload.considerIp = options.considerIp;
			}

			if (options.cellTowers && options.cellTowers.length > 0) {
				payload.cellTowers = options.cellTowers;
			}

			if (options.wifiAccessPoints && options.wifiAccessPoints.length > 0) {
				payload.wifiAccessPoints = options.wifiAccessPoints;
			}

			const response = await axios.post(
				`${this.geolocationBaseUrl}?key=${this.apiKey}`,
				payload,
			);

			if (!response.data.location) {
				console.error("Geolocation API failed");
				return null;
			}

			const result = response.data;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.GeolocationResult,
					"getCurrentLocation",
				);
			}
			return result;
		} catch (error) {
			console.error("Geolocation API Error:", error);
			throw new Error(`Failed to get current location: ${error.message}`);
		}
	}

	getStreetViewImageUrl(options) {
		const params = new URLSearchParams();

		if (options.location) {
			if (typeof options.location === "string") {
				params.append("location", options.location);
			} else {
				params.append(
					"location",
					`${options.location.lat},${options.location.lng}`,
				);
			}
		}

		if (options.pano) {
			params.append("pano", options.pano);
		}

		if (!options.location && !options.pano) {
			throw new Error("Either location or pano is required for Street View");
		}

		params.append("size", options.size || "600x400");
		if (options.heading !== undefined)
			params.append("heading", options.heading.toString());
		if (options.pitch !== undefined)
			params.append("pitch", options.pitch.toString());
		if (options.fov !== undefined) params.append("fov", options.fov.toString());
		if (options.radius !== undefined)
			params.append("radius", options.radius.toString());
		if (options.return_error_code !== undefined)
			params.append("return_error_code", options.return_error_code.toString());
		if (options.source) params.append("source", options.source);
		params.append("key", this.apiKey);

		return `${this.streetViewBaseUrl}?${params.toString()}`;
	}

	async getStreetViewMetadata(options) {
		try {
			const params = {
				key: this.apiKey,
			};

			if (options.location) {
				if (typeof options.location === "string") {
					params.location = options.location;
				} else {
					params.location = `${options.location.lat},${options.location.lng}`;
				}
			}

			if (options.pano) {
				params.pano = options.pano;
			}

			if (!options.location && !options.pano) {
				throw new Error(
					"Either location or pano is required for Street View metadata",
				);
			}

			if (options.radius !== undefined) params.radius = options.radius;
			if (options.source) params.source = options.source;

			const response = await axios.get(this.streetViewMetadataBaseUrl, {
				params,
			});

			const result = response.data;
			if (result && result.status === "OK") {
				validatePropTypes(
					result,
					PropTypesDefinitions.StreetViewResult,
					"getStreetViewMetadata",
				);
			}
			return result;
		} catch (error) {
			console.error("Street View Metadata Error:", error);
			throw new Error(`Failed to get Street View metadata: ${error.message}`);
		}
	}

	async getElevation(locations, samples) {
		try {
			const params = { key: this.apiKey };

			if (typeof locations === "string" && samples) {
				params.path = locations;
				params.samples = samples.toString();
			} else if (Array.isArray(locations)) {
				const locationsStr = locations
					.map((loc) => {
						if (typeof loc === "string") return loc;
						return `${loc.lat},${loc.lng}`;
					})
					.join("|");
				params.locations = locationsStr;
			} else if (typeof locations === "object") {
				params.locations = `${locations.lat},${locations.lng}`;
			}

			const response = await axios.get(this.elevationBaseUrl, { params });

			if (response.data.status !== "OK") {
				console.error(
					`Elevation API failed with status: ${response.data.status}`,
				);
				return null;
			}

			const results = response.data.results;
			if (results && results.length > 0) {
				results.forEach((result, index) => {
					validatePropTypes(
						result,
						PropTypesDefinitions.ElevationResult,
						`getElevation[${index}]`,
					);
				});
			}
			return results;
		} catch (error) {
			console.error("Elevation API Error:", error);
			throw new Error(`Failed to get elevation data: ${error.message}`);
		}
	}

	async getTimeZone(
		location,
		timestamp = Math.floor(Date.now() / 1000),
		language,
	) {
		try {
			const response = await axios.get(this.timeZoneBaseUrl, {
				params: {
					location: `${location.lat},${location.lng}`,
					timestamp,
					language,
					key: this.apiKey,
				},
			});

			if (response.data.status !== "OK") {
				console.error(
					`Time Zone API failed with status: ${response.data.status}`,
				);
				return null;
			}

			const result = response.data;
			if (result) {
				validatePropTypes(
					result,
					PropTypesDefinitions.TimeZoneResult,
					"getTimeZone",
				);
			}
			return result;
		} catch (error) {
			console.error("Time Zone API Error:", error);
			throw new Error(`Failed to get time zone data: ${error.message}`);
		}
	}

	// Test methods remain the same but simplified
	async testGeocoding(address) {
		const result = await this.geocodeAddress(address);
		console.log("Geocoding Response:", result);
		return result;
	}

	async testPlacesSearch(query) {
		const result = await this.searchPlaces(query);
		console.log("Place Search Response:", result);
		return result;
	}

	async testDistanceMatrix(origin, destination) {
		const result = await this.getDistanceMatrix(origin, destination);
		console.log("Distance Matrix Response:", result);
		return result;
	}

	async testDirections(origin, destination) {
		const result = await this.getDirections(origin, destination);
		console.log("Directions Response:", result);
		return result;
	}

	async testPlacesAutocomplete(input) {
		const result = await this.getPlacesAutocomplete(input);
		console.log("Places Autocomplete Response:", result);
		return result;
	}

	async testGeolocation() {
		const result = await this.getCurrentLocation({ considerIp: true });
		console.log("Geolocation Response:", result);
		return result;
	}

	async testStreetView(location) {
		const metadata = await this.getStreetViewMetadata({ location });
		console.log("Street View Metadata Response:", metadata);

		if (metadata?.status === "OK") {
			const imageUrl = this.getStreetViewImageUrl({
				location,
				size: "600x300",
				heading: 180,
				pitch: 0,
			});
			console.log("Street View Image URL:", imageUrl);
		}

		return metadata;
	}

	async testElevation(location) {
		const result = await this.getElevation([location]);
		console.log("Elevation Response:", result);
		return result;
	}

	async testTimeZone(location) {
		const result = await this.getTimeZone(location);
		console.log("Time Zone Response:", result);
		return result;
	}
}

export { GoogleMapsService, PropTypesDefinitions };
