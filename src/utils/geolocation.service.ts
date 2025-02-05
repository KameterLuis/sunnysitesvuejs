const mapboxAPI = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
const access_token = 'pk.eyJ1IjoibG9raTkxOSIsImEiOiJjbG1xNjF6amEwMGRzMm9ycjk4cnRiNHVrIn0.-zmJ-2xdZoqBOjAgc8taiA'

let rateLimiter = 0;
let lastRequest = new Date();

//AIzaSyBOQTDR0PUStWQDPXzrfRtX-ubFLQU6_8I API key for google maps api

export async function getLocation(query: string) {
    const timeDelta = (new Date()).valueOf() - lastRequest.valueOf();
    lastRequest = new Date();
    rateLimiter++;
    if(timeDelta > 2000) rateLimiter = 0;
    if(rateLimiter > 20 && timeDelta < 1000) {
        setTimeout(() => {
            rateLimiter = 0;
        }, 100000);
    } else {
        const response = await fetch(`${mapboxAPI}${query}.json?&access_token=${access_token}`);
        return await response.json();
    }
}