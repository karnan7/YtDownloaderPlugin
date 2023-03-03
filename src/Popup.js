  /*global chrome*/
import React, {useState, useEffect} from "react";
import './Popup.css';
import { Container, Button, Input, Form, FormGroup, InputGroup } from 'reactstrap'
import "bootstrap/dist/css/bootstrap.min.css";
import ytdl from 'ytdl-core';



const Popup =() => {
    const[videoUrl, setVideoUrl] = useState("");
    const[resolution, setResolution] = useState("720p");
    const[downloadProgress, setDownloadProgress] = useState("0");

    const handleDownload= async ( resolution)=>{
        const videoInfo = await ytdl.getInfo(videoUrl);
        console.log("videoInfo",videoInfo);
        const videoFormats = ytdl.filterFormats(videoInfo.formats, 'videoonly');
        const selectedFormat = videoFormats.find((format) => format.qualityLabel === resolution);
        const videoLink = selectedFormat.url
        const videoTitle = videoInfo.videoDetails.title;
   
        const downloadId = await chrome.downloads.download({
            url: videoLink,
            filename: `${videoTitle}.mp4`,
            saveAs: false,
            conflictAction: 'overwrite',
            method: 'GET',
            headers: [],
        });
        console.log('Download ID:', downloadId);
        

        chrome.downloads.onChanged.addListener((downloadDelta) => {
          if (downloadDelta.id === downloadId && downloadDelta.state) {
            
            if (downloadDelta.state.current === 'in_progress') {
              const progress = Math.round((downloadDelta.bytesReceived / downloadDelta.totalBytes) * 100);
              setDownloadProgress(progress);

            } else if (downloadDelta.state.current === 'complete') {
                chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Download Complete',
                message: 'The video has been downloaded successfully.',
              });
              setDownloadProgress(0);
            }
          }
        });
    }
    
    useEffect(() => {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const url = tabs[0].url;
          if (url.startsWith("https://www.youtube.com/watch")) {
            setVideoUrl(url);
          }
        });
      }
    }, []);

    return (
      <Container fluid className="popup">
        <h1 className="text-center">YouTube Video Downloader</h1>
            <Form>
              <FormGroup className="form-group">
                <InputGroup>
                  <Input 
                  type="text" 
                  name="url"
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)}
                  // readOnly
                  />
                  <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                      <option value="360p">360p</option>
                      <option value="480p">480p</option>
                      <option value="720p">720p</option>
                  </select>
                </InputGroup>
              </FormGroup>
            </Form>
            <Button onClick={handleDownload} color="primary">Download</Button>
            <div>Download Progress: {downloadProgress}%</div>
      </Container>
    )
}

export default Popup;



