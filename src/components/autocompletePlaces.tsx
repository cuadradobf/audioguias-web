import { GeoPoint } from "firebase/firestore";
import { ChangeEvent, useEffect } from "react";
import usePlacesAutocomplete, {
    getDetails,
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";


interface AutocompletePlacesProps {
    placeId: string | null | undefined
    setPoint: (point: GeoPoint) => void
    setPlaceId: (placeId: string) => void
}

export default function AutocompletePlaces(props: AutocompletePlacesProps) {

    useEffect(() => {
        if (props.placeId) {
            getDetails({ placeId: props.placeId })
                .then((details) => {
                    const results = details as google.maps.places.PlaceResult;
                    console.log("Details: ", details);
                    setValue(results.formatted_address!, false);
                })
                .catch((error) => {
                    console.log("Error: ", error);
                });
        }
    }, [props.placeId]);

    const callbackAutoplaces = () => {
        console.log("Autoplaces loaded");
    }

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        callbackName: "callbackAutoplaces",
        requestOptions: {
            /* Define search scope here */
        },
        debounce: 300,
    });


    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        // Update the keyword of the input element
        setValue(e.target.value);
    };

    const handleSelect = (ev: string | google.maps.places.AutocompletePrediction) => () => {

        const description = typeof ev === "string" ? ev : ev.description;
        // When the user selects a place, we can replace the keyword without request data from API
        // by setting the second parameter to "false"
        setValue(description, false);
        clearSuggestions();

        // Get latitude and longitude via utility functions
        getGeocode({ address: description }).then((results) => {
            console.log(results);
            const { lat, lng } = getLatLng(results[0]);
            console.log("📍 Coordinates: ", { lat, lng });
            props.setPoint(new GeoPoint(lat, lng));
            props.setPlaceId(results[0].place_id);
            // results[0].address_components.find((component) => component.types.includes("country"));
        });
    };

    const renderSuggestions = () =>
        data.map((suggestion) => {
            const {
                place_id,
                structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
                <li key={place_id} onClick={handleSelect(suggestion)}>
                    <strong>{main_text}</strong> <small>{secondary_text}</small>
                </li>
            );
        });

    return (
        <div>
            <input
                className="defaultInput"
                value={value}
                onChange={handleInput}
                disabled={!ready}
                placeholder="Where are you going?"
            />
            {/* We can use the "status" to decide whether we should display the dropdown or not */}
            {status === "OK" && <ul>{renderSuggestions()}</ul>}


            <script async
                src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBB1VMFpn3cSW_YUWTYV4sRGyEx2JH_2sg&libraries=places&callback=callbackAutoplaces">
            </script>
        </div>

    );
};