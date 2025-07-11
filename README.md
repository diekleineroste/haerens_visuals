# haerens_visuals

This is the website made for the videographer/photographer Jaron Haerens.
Beneath is some valuable info for editing the data.json file and setting up the project yourself.

## Data.json Structure Guide

### Portfolio Cards
- `title`: String - The project title
- `video`: Boolean - Whether this project includes video work*
- `photo`: Boolean - Whether this project includes photography*
- `graphic`: Boolean - Whether this project includes graphic design*
- `fileName`: String - Main image/video file for the project
- `isVideo`: Boolean - Whether the main file is a video*
- `gallery`: Array - Additional images/videos for the project<br>
<sub>* yes = `true`| no = `false`</sub>

### File Requirements
- Images: .png, .jpg, .jpeg .gif .webp supported
- Videos: .mp4 .mov .avi supported
- All files should be in the public assets directory as referenced

### Worst case scenario
Copy `data.json.template` to `data.json` and replace all the ALL_CAPS placeholders with actual content

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
