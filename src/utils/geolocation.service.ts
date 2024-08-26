const mapboxAPI = 'https://api.mapbox.com/search/searchbox/v1/suggest?q='
const access_token = 'pk.eyJ1IjoibG9raTkxOSIsImEiOiJjbG1xNjF6amEwMGRzMm9ycjk4cnRiNHVrIn0.-zmJ-2xdZoqBOjAgc8taiA'

export async function getLocation(query: string) {
    const response = await fetch(`${mapboxAPI}${query}&access_token=${access_token}`);
    return await response.json();
}