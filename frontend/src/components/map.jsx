"use client";

/**
 * @file google-map.jsx
 * @fileoverview A comprehensive Google Maps component for displaying locations with clustering, filtering, and interactive markers.
 * The component includes features like:
 * - Marker clustering for better visualization of dense areas
 * - Status-based filtering (Active, Inactive, Special locations)
 * - Interactive info windows with location details
 * - Custom map styling and restricted bounds
 * - Responsive design and loading states
 * - Scroll lock when interacting with map
 */

import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
	APIProvider,
	InfoWindow,
	Map,
	useMap,
} from "@vis.gl/react-google-maps";
import { AnimatePresence, motion } from "motion/react";
import PropTypes from "prop-types";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

/**
 * PropTypes definitions for the component
 */
const LocationInfoPropType = PropTypes.shape({
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	coordinates: PropTypes.arrayOf(PropTypes.number).isRequired, // [latitude, longitude]
	status: PropTypes.oneOf(["Active", "Inactive", "Special"]).isRequired,
	establishedDate: PropTypes.string,
	description: PropTypes.string,
	address: PropTypes.string,
	city: PropTypes.string,
	state: PropTypes.string,
	country: PropTypes.string,
	notes: PropTypes.string,
	category: PropTypes.string,
});

const LocationDataPropType = PropTypes.shape({
	active: PropTypes.arrayOf(LocationInfoPropType).isRequired,
	inactive: PropTypes.arrayOf(LocationInfoPropType).isRequired,
	special: PropTypes.arrayOf(LocationInfoPropType).isRequired,
});

const CoordinatesPropType = PropTypes.shape({
	lat: PropTypes.number.isRequired,
	lng: PropTypes.number.isRequired,
});

const BoundsPropType = PropTypes.shape({
	north: PropTypes.number.isRequired,
	south: PropTypes.number.isRequired,
	west: PropTypes.number.isRequired,
	east: PropTypes.number.isRequired,
});

const MapStylePropType = PropTypes.shape({
	featureType: PropTypes.string,
	elementType: PropTypes.string,
	stylers: PropTypes.arrayOf(PropTypes.object),
});

/**
 * Color configurations for different location statuses.
 * Each status has associated background, text, and badge colors.
 */
const MARKER_COLORS = {
	Active: { bg: "#22c55e", text: "#ffffff", badge: "bg-green-500" },
	Special: { bg: "#f59e0b", text: "#ffffff", badge: "bg-amber-500" },
	Inactive: { bg: "#9ca3af", text: "#ffffff", badge: "bg-gray-400" },
};

/**
 * Default geographic bounds (North America)
 */
const DEFAULT_BOUNDS = {
	north: 71.5388001,
	south: 15.7835,
	west: -167.2764,
	east: -52.648,
};

/**
 * Default center coordinates (center of USA)
 */
const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

/**
 * Default map styles
 */
const DEFAULT_MAP_STYLES = [
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
	},
	{
		featureType: "landscape",
		elementType: "geometry",
		stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
	},
	{
		featureType: "administrative",
		elementType: "labels.text.fill",
		stylers: [{ color: "#374151" }],
	},
];

/**
 * Main Google Maps component that displays locations with filtering capabilities.
 */
export const GoogleMaps = memo(
	({
		locations,
		center = DEFAULT_CENTER,
		bounds = DEFAULT_BOUNDS,
		mapStyles = DEFAULT_MAP_STYLES,
		minZoom = 4,
		maxZoom = 18,
		defaultZoom = 4,
		onViewDetails,
	}) => {
		const { toast } = useToast();
		const mapContainerRef = useRef(null);
		const [mapZoom, setMapZoom] = useState(defaultZoom);
		const [isLoading, setIsLoading] = useState(true);
		const [statusFilter, setStatusFilter] = useState("All");

		/**
		 * Disables page scrolling when mouse enters map container
		 */
		const disableScroll = useCallback(() => {
			document.body.style.overflow = "hidden";
		}, []);

		/**
		 * Enables page scrolling when mouse leaves map container
		 */
		const enableScroll = useCallback(() => {
			document.body.style.overflow = "auto";
		}, []);

		useEffect(() => {
			const container = mapContainerRef.current;
			if (!container) return;

			container.addEventListener("mouseenter", disableScroll);
			container.addEventListener("mouseleave", enableScroll);

			return () => {
				container.removeEventListener("mouseenter", disableScroll);
				container.removeEventListener("mouseleave", enableScroll);
			};
		}, [disableScroll, enableScroll]);

		useEffect(() => {
			const timer = setTimeout(() => {
				setIsLoading(false);
			}, 1000);

			return () => clearTimeout(timer);
		}, []);

		/**
		 * Get unique statuses from locations
		 */
		const availableStatuses = useMemo(() => {
			const statuses = new Set();
			[
				...locations.active,
				...locations.inactive,
				...locations.special,
			].forEach((location) => {
				statuses.add(location.status);
			});
			return ["All", ...Array.from(statuses)];
		}, [locations]);

		/**
		 * Memoized map options for Google Maps configuration
		 */
		const mapOptions = useMemo(
			() => ({
				gestureHandling: "cooperative",
				restriction: {
					latLngBounds: bounds,
					strictBounds: false,
				},
				disableDefaultUI: false,
				zoomControl: true,
				mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: false,
				styles: mapStyles,
				minZoom,
				maxZoom,
			}),
			[bounds, mapStyles, minZoom, maxZoom],
		);

		useEffect(() => {
			if (!isLoading) {
				toast({
					title: "Map Controls",
					description: "Use keyboard +/- or left click to zoom",
					duration: 5000,
				});
			}
		}, [isLoading, toast]);

		return (
			<Card className="max-w-full bg-white shadow-none p-0 m-0 border-none mx-auto">
				<CardContent className="p-0 space-y-6">
					{/* Filter buttons */}
					<div className="flex flex-wrap gap-2 mb-4">
						{availableStatuses.map((status) => (
							<Button
								key={status}
								variant={statusFilter === status ? "default" : "outline"}
								size="sm"
								onClick={() => setStatusFilter(status)}
								className="text-sm"
							>
								{status}
								{status !== "All" && (
									<Badge className="ml-2 text-xs">
										{status === "Active" && locations.active.length}
										{status === "Inactive" && locations.inactive.length}
										{status === "Special" && locations.special.length}
									</Badge>
								)}
							</Button>
						))}
					</div>

					{isLoading ? (
						<Skeleton className="w-full h-[600px] rounded-xl" />
					) : (
						<div className="relative">
							<div
								ref={mapContainerRef}
								className="w-full h-[600px] rounded-xl overflow-hidden shadow-xl border border-gray-200"
							>
								<APIProvider apiKey={`GOOGLE_MAPS_API_KEY`}>
									<Map
										defaultCenter={center}
										zoom={mapZoom}
										onCameraChanged={(ev) => setMapZoom(ev.detail.zoom)}
										mapId={`GOOGLE_MAPS_MAP_ID`}
										{...mapOptions}
									>
										<Markers
											locations={locations}
											mapZoom={mapZoom}
											statusFilter={statusFilter}
											bounds={bounds}
											onViewDetails={onViewDetails}
										/>
									</Map>
								</APIProvider>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	},
);

GoogleMaps.propTypes = {
	locations: LocationDataPropType.isRequired,
	center: CoordinatesPropType,
	bounds: BoundsPropType,
	mapStyles: PropTypes.arrayOf(MapStylePropType),
	minZoom: PropTypes.number,
	maxZoom: PropTypes.number,
	defaultZoom: PropTypes.number,
	onViewDetails: PropTypes.func,
};

GoogleMaps.displayName = "GoogleMaps";

/**
 * Component that handles the rendering and management of map markers and clustering
 */
const Markers = memo(({ locations, mapZoom, statusFilter, bounds, onViewDetails }) => {
	const map = useMap();
	const [activeMarker, setActiveMarker] = useState(null);
	const clusterer = useRef(null);

	/**
	 * Filtered and processed locations based on status filter and geographic bounds
	 */
	const filteredLocations = useMemo(() => {
		const combined = [
			...locations.active,
			...locations.inactive,
			...locations.special,
		];
		return combined.filter((location) => {
			const [lat, lng] = location.coordinates;
			const withinBounds =
				lat <= bounds.north &&
				lat >= bounds.south &&
				lng >= bounds.west &&
				lng <= bounds.east;

			const matchesFilter =
				statusFilter === "All" || location.status === statusFilter;

			return withinBounds && matchesFilter;
		});
	}, [locations, statusFilter, bounds]);

	/**
	 * Handles marker click events
	 */
	const handleMarkerClick = useCallback((locationId) => {
		setActiveMarker((prev) => (prev === locationId ? null : locationId));
	}, []);

	useEffect(() => {
		if (!map || !window.google?.maps) return;

		// Wait for Google Maps to be fully loaded
		const initializeClusterer = () => {
			clusterer.current = new MarkerClusterer({
				map,
				markers: [],
				renderer: {
					render: ({ count, position }) => {
						let clusterMarker;

						// Try to use AdvancedMarkerElement if available, fallback to standard Marker
						if (window.google?.maps?.marker?.AdvancedMarkerElement) {
							clusterMarker = new google.maps.marker.AdvancedMarkerElement({
								position,
								content: createClusterMarkerContent(count),
							});
						} else {
							// Fallback to standard Marker
							clusterMarker = new google.maps.Marker({
								position,
								icon: {
									url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createClusterMarkerSVG(count))}`,
									scaledSize: new google.maps.Size(40, 40),
									anchor: new google.maps.Point(20, 20),
								},
							});
						}

						google.maps.event.addListener(clusterMarker, "click", () => {
							const zoom = map.getZoom() || 0;
							map.setZoom(zoom + 1);
							map.setCenter(position);
						});

						return clusterMarker;
					},
				},
			});
		};

		// Check if Google Maps is ready
		if (window.google?.maps?.Marker) {
			initializeClusterer();
		} else {
			// Wait a bit more for Google Maps to load
			const timer = setTimeout(initializeClusterer, 1000);
			return () => clearTimeout(timer);
		}

		return () => {
			if (clusterer.current) {
				clusterer.current.clearMarkers();
				clusterer.current = null;
			}
		};
	}, [map]);

	useEffect(() => {
		if (!clusterer.current || !window.google?.maps) return;

		const markers = filteredLocations.map((location) => {
			const { bg } = MARKER_COLORS[location.status];
			let marker;

			// Try to use AdvancedMarkerElement if available, fallback to standard Marker
			if (window.google?.maps?.marker?.AdvancedMarkerElement) {
				marker = new google.maps.marker.AdvancedMarkerElement({
					position: {
						lat: location.coordinates[0],
						lng: location.coordinates[1],
					},
					content: createMarkerContent(bg),
				});
			} else {
				// Fallback to standard Marker
				marker = new google.maps.Marker({
					position: {
						lat: location.coordinates[0],
						lng: location.coordinates[1],
					},
					icon: {
						url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createMarkerSVG(bg))}`,
						scaledSize: new google.maps.Size(32, 32),
						anchor: new google.maps.Point(16, 32),
					},
				});
			}

			google.maps.event.addListener(marker, "click", () =>
				handleMarkerClick(location.id),
			);
			return marker;
		});

		clusterer.current.clearMarkers();
		clusterer.current.addMarkers(markers);
	}, [filteredLocations, handleMarkerClick]);

	return (
		<AnimatePresence>
			{activeMarker && (
				<InfoWindow
					position={{
						lat:
							filteredLocations.find((location) => location.id === activeMarker)
								?.coordinates[0] || 0,
						lng:
							filteredLocations.find((location) => location.id === activeMarker)
								?.coordinates[1] || 0,
					}}
					onCloseClick={() => setActiveMarker(null)}
				>
					<LocationInfo
						location={filteredLocations.find(
							(location) => location.id === activeMarker,
						)}
						onViewDetails={onViewDetails}
					/>
				</InfoWindow>
			)}
		</AnimatePresence>
	);
});

Markers.propTypes = {
	locations: LocationDataPropType.isRequired,
	mapZoom: PropTypes.number.isRequired,
	statusFilter: PropTypes.string.isRequired,
	bounds: BoundsPropType.isRequired,
	onViewDetails: PropTypes.func,
};

Markers.displayName = "Markers";

/**
 * Component that displays detailed information about a location in an info window
 */
const LocationInfo = memo(({ location, onViewDetails }) => (
	<motion.div
		initial={{ opacity: 0, y: -20 }}
		animate={{ opacity: 1, y: 0 }}
		exit={{ opacity: 0, y: 20 }}
		className="bg-white text-gray-800 p-6 rounded-xl border-none max-w-sm"
	>
		<div className="flex items-center gap-2 mb-4">
			<Badge
				className={`${MARKER_COLORS[location.status].badge} text-sm px-3 py-1`}
			>
				{location.status === 'Active' ? 'Grade A' : location.status === 'Special' ? 'Grade B' : location.status}
			</Badge>
			{location.establishedDate && (
				<span className="text-gray-500 text-sm">
					<FaCalendarAlt className="inline mr-1" />
					Est. {location.establishedDate}
				</span>
			)}
		</div>

		<h3 className="text-xl font-bold mb-2 text-gray-800">{location.name}</h3>

		{location.description && (
			<p className="text-sm mb-2 text-gray-600">{location.description}</p>
		)}

		{location.address && (
			<p className="text-sm mb-1">
				<FaMapMarkerAlt className="inline mr-1" />
				<strong>Address:</strong> {location.address}
			</p>
		)}

		{(location.city || location.state || location.country) && (
			<p className="text-sm mb-1">
				<strong>Location:</strong>{" "}
				{[location.city, location.state, location.country]
					.filter(Boolean)
					.join(", ")}
			</p>
		)}

		{location.category && (
			<p className="text-sm mb-1">
				<strong>Info:</strong> {location.category}
			</p>
		)}

		{location.notes && (
			<p className="text-sm mt-2 italic text-gray-600 line-clamp-2">{location.notes}</p>
		)}

		<div className="flex gap-2 mt-4">
			{location._originalData && onViewDetails && (
				<Button
					className="flex-1"
					variant="solid"
					onClick={() => onViewDetails(location._originalData)}
				>
					View Details
				</Button>
			)}
			<Button
				className={location._originalData ? 'flex-1' : 'w-full'}
				variant={location._originalData ? "outline" : "solid"}
				onClick={() =>
					window.open(
						`https://www.google.com/maps/search/?api=1&query=${location.coordinates[0]},${location.coordinates[1]}`,
						"_blank",
					)
				}
			>
				Google Maps
			</Button>
		</div>
	</motion.div>
));

LocationInfo.propTypes = {
	location: LocationInfoPropType.isRequired,
	onViewDetails: PropTypes.func,
};

LocationInfo.displayName = "LocationInfo";

/**
 * Creates a custom marker element with specified background color
 */
function createMarkerContent(bgColor) {
	const div = document.createElement("div");
	div.innerHTML = `
    <div style="
      background-color: ${bgColor};
      padding: 0.5rem;
      border-radius: 50%;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="white">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
      </svg>
    </div>
  `;
	return div.firstElementChild;
}

/**
 * Creates an SVG string for standard markers (fallback)
 */
function createMarkerSVG(bgColor) {
	return `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${bgColor}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `;
}

/**
 * Creates a custom cluster marker element with a count
 */
function createClusterMarkerContent(count) {
	const div = document.createElement("div");
	div.innerHTML = `
    <div style="
      background-color: #374151;
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    ">
      ${count}
    </div>
  `;
	return div.firstElementChild;
}

/**
 * Creates an SVG string for cluster markers (fallback)
 */
function createClusterMarkerSVG(count) {
	return `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#374151" stroke="white" stroke-width="2"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${count}</text>
    </svg>
  `;
}

// Example usage with sample data
export const sampleLocations = {
	active: [
		{
			id: "loc-001",
			name: "Main Office",
			coordinates: [40.7128, -74.006],
			status: "Active",
			establishedDate: "2020",
			description: "Primary business location",
			address: "123 Business St",
			city: "New York",
			state: "NY",
			country: "USA",
			category: "Office",
		},
	],
	inactive: [
		{
			id: "loc-002",
			name: "Former Branch",
			coordinates: [34.0522, -118.2437],
			status: "Inactive",
			establishedDate: "2018",
			description: "Previous location, now closed",
			city: "Los Angeles",
			state: "CA",
			country: "USA",
			category: "Branch",
			notes: "Closed due to relocation",
		},
	],
	special: [
		{
			id: "loc-003",
			name: "Research Facility",
			coordinates: [37.7749, -122.4194],
			status: "Special",
			establishedDate: "2022",
			description: "Advanced research and development center",
			city: "San Francisco",
			state: "CA",
			country: "USA",
			category: "Research",
		},
	],
};

export default GoogleMaps;
