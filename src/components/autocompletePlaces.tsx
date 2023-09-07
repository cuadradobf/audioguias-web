import { GeoPoint } from "firebase/firestore";
import { ChangeEvent, useEffect, useState } from "react";

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

    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {

        const script = document.createElement('script');

        if (!scriptLoaded) {
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBB1VMFpn3cSW_YUWTYV4sRGyEx2JH_2sg&libraries=places&callback=callbackAutoplaces';
            script.async = true;

            script.onload = () => {
                setScriptLoaded(true);
            };

            document.body.appendChild(script);
        }

        if (scriptLoaded && props.placeId != null && props.placeId != undefined) {
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

    if (!scriptLoaded) {
        return ( <div role="status">
        <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span className="sr-only">Loading...</span>
    </div>);
    }
        
    return (
        <div>
            <input
                className="defaultInput"
                value={value}
                onChange={handleInput}
                disabled={!ready}
            />
            {/* We can use the "status" to decide whether we should display the dropdown or not */}
            {status === "OK" && <ul>{renderSuggestions()}</ul>}

        </div>

    );
};