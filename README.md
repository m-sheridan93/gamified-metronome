# 🎵 Gamified Metronome

A modern, interactive metronome application built with Vue 3, Vite, and Vuetify. This web-based metronome provides precise timing control with customizable audio feedback for musicians and music students.

## ✨ Features

### Core Metronome Functionality
- **Precise BPM Control**: Adjustable tempo from 20 to 300 BPM
- **Dual Input Methods**: 
  - Text field for exact BPM entry
  - Interactive slider for quick adjustments
- **Real-time Audio**: Web Audio API-powered sound generation
- **Multiple Sound Types**: 
  - Tick: Traditional metronome click with decay
  - Beep: Simple sine wave tone
- **Volume Control**: Adjustable volume from 0-100% with real-time feedback
- **Start/Stop Control**: Simple toggle to start and stop the metronome

### Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **Material Design UI**: Clean, modern interface using Vuetify components
- **Real-time Updates**: BPM changes apply immediately while running
- **Web Audio API**: High-precision audio timing without external audio files
- **Vue 3 Composition API**: Modern reactive architecture

## 🎯 User Interface

The application features a clean, card-based layout with:
- **Header Bar**: Application title with primary color theme
- **Main Controls**: 
  - BPM input field (20-300 range)
  - BPM slider for visual adjustment
  - Volume slider (0-100%)
  - Sound type selector (Tick/Beep)
  - Large Start/Stop button
- **Real-time Feedback**: Current BPM and volume percentage display

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Modern web browser with Web Audio API support

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gamified-metronome
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Metronome.vue          # Main metronome component with audio logic
│   └── MetonomeControls.vue   # Control interface (BPM, volume, sound type)
├── assets/                    # Static assets (Vue logo)
├── App.vue                    # Root component with Vuetify layout
├── main.js                    # Application entry point with Vuetify setup
└── style.css                  # Global styles and theme
```

## 🔧 Technical Implementation

### Audio System
- **Web Audio API**: Creates AudioContext for precise timing
- **Oscillator Nodes**: Generates sine wave tones at 1000Hz
- **Gain Nodes**: Controls volume and creates tick decay effect
- **Timing**: Uses `setInterval` with calculated millisecond intervals

### Component Architecture
- **Metronome.vue**: Core logic, audio generation, state management
- **MetonomeControls.vue**: UI controls with two-way data binding
- **App.vue**: Layout wrapper with Vuetify app structure

### State Management
- **Reactive References**: BPM (100), volume (1.0), soundType ('Tick'), running state
- **Watchers**: Automatically restart metronome when BPM changes during playback
- **Event Emitters**: Child-to-parent communication for control updates

## 🎼 Usage Guide

1. **Set Your Tempo**: 
   - Type exact BPM in the text field (20-300)
   - Or use the slider for quick adjustments

2. **Adjust Volume**: 
   - Use the volume slider to set comfortable listening level
   - Volume percentage displays in real-time

3. **Choose Sound**: 
   - **Tick**: Traditional metronome sound with natural decay
   - **Beep**: Simple, clean sine wave tone

4. **Start Playing**: 
   - Click the "Start" button to begin the metronome
   - Button changes to "Stop" while running
   - BPM changes apply immediately during playback

## 🔧 Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Fast build tool and development server
- **Vuetify 3** - Material Design component library
- **Sass** - CSS preprocessor for enhanced styling
- **Web Audio API** - Browser-native audio generation and processing

## 🌐 Browser Compatibility

- Chrome/Chromium 66+
- Firefox 60+
- Safari 14.1+
- Edge 79+

*Note: Requires Web Audio API support for audio functionality*

## 🎵 Audio Technical Details

### Sound Generation
- **Frequency**: 1000Hz sine wave for both tick and beep
- **Tick Duration**: 70ms with exponential decay
- **Beep Duration**: 50ms constant volume
- **Timing Precision**: Calculated as `(60 / BPM) * 1000` milliseconds

### Performance
- **Low Latency**: Direct Web Audio API usage
- **CPU Efficient**: Minimal overhead audio generation
- **Memory Safe**: Automatic cleanup of audio contexts

## 📚 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

## 🔮 Future Enhancements

Potential features for future development:
- Beat subdivision (quarter notes, eighth notes, triplets)
- Visual metronome with animated beat indicator
- Preset tempo markings (Allegro, Andante, etc.)
- Practice session tracking and statistics
- Custom sound uploads
- Accent patterns for complex time signatures
- Tap tempo functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ for musicians and music students*
