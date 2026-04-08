import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";
import type { Part } from "../../types/a2a.js";
import { config } from "../../config.js";

const SAMPLE_IMAGES = [
  {
    path: "/media/sample-image.jpg",
    filename: "sample-image.jpg",
    mediaType: "image/jpeg",
    description: "A sample JPEG image with color gradients",
  },
  {
    path: "/media/sample-image.png",
    filename: "sample-image.png",
    mediaType: "image/png",
    description: "A sample PNG image with solid color",
  },
];

const SAMPLE_AUDIO = [
  {
    path: "/media/sample-audio.wav",
    filename: "sample-audio.wav",
    mediaType: "audio/wav",
    description: "A 1-second 440Hz sine wave tone (WAV format)",
  },
];

const SAMPLE_VIDEOS = [
  {
    path: "/media/sample-video.mp4",
    filename: "sample-video.mp4",
    mediaType: "video/mp4",
    description: "A minimal sample video (MP4 format)",
  },
];

const SAMPLE_DATA = {
  title: "Media Agent Demo Data",
  supportedFormats: {
    images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    audio: ["audio/mpeg", "audio/ogg", "audio/wav"],
    video: ["video/mp4", "video/webm"],
  },
  sampleMetrics: {
    totalMediaServed: 1247,
    averageResponseTimeMs: 42,
    mostRequestedType: "image",
  },
};

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<mediaReport>
  <title>Media Agent Demo Report</title>
  <generatedAt>{{TIMESTAMP}}</generatedAt>
  <supportedFormats>
    <format type="image">
      <mimeType>image/jpeg</mimeType>
      <mimeType>image/png</mimeType>
      <mimeType>image/gif</mimeType>
      <mimeType>image/webp</mimeType>
    </format>
    <format type="audio">
      <mimeType>audio/mpeg</mimeType>
      <mimeType>audio/ogg</mimeType>
      <mimeType>audio/wav</mimeType>
    </format>
    <format type="video">
      <mimeType>video/mp4</mimeType>
      <mimeType>video/webm</mimeType>
    </format>
  </supportedFormats>
  <sampleMetrics>
    <totalMediaServed>1247</totalMediaServed>
    <averageResponseTimeMs>42</averageResponseTimeMs>
    <mostRequestedType>image</mostRequestedType>
  </sampleMetrics>
</mediaReport>`;

const SAMPLE_YAML = `# Media Agent Demo Report
title: Media Agent Demo Report
generatedAt: "{{TIMESTAMP}}"
supportedFormats:
  image:
    - image/jpeg
    - image/png
    - image/gif
    - image/webp
  audio:
    - audio/mpeg
    - audio/ogg
    - audio/wav
  video:
    - video/mp4
    - video/webm
sampleMetrics:
  totalMediaServed: 1247
  averageResponseTimeMs: 42
  mostRequestedType: image`;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class MediaAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "media",
      name: "Media Showcase",
      description:
        "Demonstrates **rich media responses** including:\n- Images (`jpeg`, `png`)\n- Audio (`wav`)\n- Video (`mp4`)\n- Structured data (`json`, `xml`, `yaml`)\n\nUsing the [A2A protocol](https://google.github.io/A2A/).",
      version: "1.0.0",
      protocolVersion: "1.0.0",
      defaultOutputModes: [
        "text/plain",
        "image/jpeg",
        "image/png",
        "audio/wav",
        "video/mp4",
        "application/json",
        "application/xml",
        "application/yaml",
      ],
      skills: [
        {
          id: "show-image",
          name: "Show Image",
          description:
            "Returns a **sample image** rendered inline.\nSupported formats:\n- `image/jpeg` — color gradient sample\n- `image/png` — solid color sample",
          tags: ["media", "image", "demo"],
          examples: ["Show me an image", "Display a picture", "I want to see a photo"],
        },
        {
          id: "play-audio",
          name: "Play Audio",
          description:
            "Returns a **sample audio clip** with an embedded player.\nFeatures:\n- `audio/wav` format — 1-second 440Hz sine wave tone\n- Demonstrates inline audio playback via the A2A protocol",
          tags: ["media", "audio", "demo"],
          examples: ["Play some audio", "Let me hear a sound", "Play music"],
        },
        {
          id: "play-video",
          name: "Play Video",
          description:
            "Returns a **sample video** with an embedded player.\nFeatures:\n- `video/mp4` format — minimal sample video\n- Demonstrates inline video playback via the A2A protocol",
          tags: ["media", "video", "demo"],
          examples: ["Show me a video", "Play a movie clip", "I want to watch something"],
        },
        {
          id: "show-data",
          name: "Show Data",
          description:
            "Returns the **same dataset** in three structured formats.\nFormats:\n- `application/json` — rendered as collapsible, syntax-highlighted content\n- `application/xml` — well-formed XML document\n- `application/yaml` — human-readable YAML representation",
          tags: ["media", "data", "json", "xml", "yaml", "demo"],
          examples: [
            "Show me some data",
            "Give me structured JSON",
            "Show XML",
            "Give me YAML",
            "Show stats",
          ],
        },
        {
          id: "media-gallery",
          name: "Media Gallery",
          description:
            "Returns a **complete gallery** with all supported media types.\nIncludes:\n- An image, audio clip, and video — each rendered natively\n- Structured data in `json` format\n- Demonstrates the full range of A2A protocol content types",
          tags: ["media", "gallery", "demo", "showcase"],
          examples: ["Show me everything", "Media gallery", "Demo all media types"],
        },
      ],
      systemPrompt:
        "You are the Media Showcase agent. You demonstrate rich content types in the A2A protocol including images, audio, video, and structured data.",
      capabilities: {
        streaming: false,
        pushNotifications: false,
      },
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
    };
  }

  public override handleMessageWithParts(userText: string): Promise<Part[]> {
    const text = userText.toLowerCase();

    if (matchesAny(text, ["gallery", "all", "everything", "showcase", "demo"])) {
      return Promise.resolve(this.buildGalleryResponse());
    }
    if (matchesAny(text, ["image", "picture", "photo", "img"])) {
      return Promise.resolve(this.buildImageResponse());
    }
    if (matchesAny(text, ["audio", "sound", "music", "song", "listen"])) {
      return Promise.resolve(this.buildAudioResponse());
    }
    if (matchesAny(text, ["video", "movie", "clip", "watch"])) {
      return Promise.resolve(this.buildVideoResponse());
    }
    if (matchesAny(text, ["data", "json", "xml", "yaml", "structured", "stats"])) {
      return Promise.resolve(this.buildDataResponse());
    }

    // Default: show gallery
    return Promise.resolve(this.buildGalleryResponse());
  }

  private buildImageResponse(): Part[] {
    const image = pickRandom(SAMPLE_IMAGES);
    return [
      {
        text: `**Sample Image**\n\n${image.description}\n\nThis demonstrates the A2A protocol's ability to return file parts with image media types, rendered inline by the frontend.`,
      },
      {
        url: `${config.serverUrl}${image.path}`,
        mediaType: image.mediaType,
        filename: image.filename,
      },
    ];
  }

  private buildAudioResponse(): Part[] {
    const audio = pickRandom(SAMPLE_AUDIO);
    return [
      {
        text: `**Sample Audio**\n\n${audio.description}\n\nThis demonstrates the A2A protocol's ability to return file parts with audio media types, rendered as an embedded audio player.`,
      },
      {
        url: `${config.serverUrl}${audio.path}`,
        mediaType: audio.mediaType,
        filename: audio.filename,
      },
    ];
  }

  private buildVideoResponse(): Part[] {
    const video = pickRandom(SAMPLE_VIDEOS);
    return [
      {
        text: `**Sample Video**\n\n${video.description}\n\nThis demonstrates the A2A protocol's ability to return file parts with video media types, rendered as an embedded video player.`,
      },
      {
        url: `${config.serverUrl}${video.path}`,
        mediaType: video.mediaType,
        filename: video.filename,
      },
    ];
  }

  private buildDataResponse(): Part[] {
    const timestamp = new Date().toISOString();
    const xml = SAMPLE_XML.replace("{{TIMESTAMP}}", timestamp);
    const yaml = SAMPLE_YAML.replace("{{TIMESTAMP}}", timestamp);
    return [
      {
        text: "**Structured Data**\n\nBelow is the same dataset in three formats — JSON, XML, and YAML — demonstrating the A2A protocol's support for different structured data content types.",
      },
      {
        data: { ...SAMPLE_DATA, generatedAt: timestamp },
      },
      {
        text: xml,
        mediaType: "application/xml",
      },
      {
        text: yaml,
        mediaType: "application/yaml",
      },
    ];
  }

  private buildGalleryResponse(): Part[] {
    const image = pickRandom(SAMPLE_IMAGES);
    const audio = pickRandom(SAMPLE_AUDIO);
    const video = pickRandom(SAMPLE_VIDEOS);

    return [
      {
        text: "**Media Gallery**\n\nThis showcases all the rich content types supported by the A2A protocol. Below you'll find an image, an audio clip, a video, and structured data — each rendered natively by the frontend.",
      },
      {
        url: `${config.serverUrl}${image.path}`,
        mediaType: image.mediaType,
        filename: image.filename,
      },
      {
        url: `${config.serverUrl}${audio.path}`,
        mediaType: audio.mediaType,
        filename: audio.filename,
      },
      {
        url: `${config.serverUrl}${video.path}`,
        mediaType: video.mediaType,
        filename: video.filename,
      },
      {
        data: { ...SAMPLE_DATA, generatedAt: new Date().toISOString() },
      },
    ];
  }
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}
