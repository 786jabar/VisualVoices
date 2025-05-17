// Script to generate sound effects for Creativity Spark feature
// Run this in the browser console to generate the sound files

function generateSparkleSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 1.5;
  const totalSamples = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, totalSamples, audioContext.sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < totalSamples; i++) {
    const t = i / audioContext.sampleRate;
    // Create a series of random pings at different frequencies
    if (Math.random() < 0.01) {
      const pingDuration = 0.1;
      const freq = 500 + Math.random() * 5000;
      
      for (let j = 0; j < pingDuration * audioContext.sampleRate && i + j < totalSamples; j++) {
        const amplitude = Math.exp(-j / (pingDuration * audioContext.sampleRate) * 10) * 0.3;
        channelData[i + j] += Math.sin(2 * Math.PI * freq * (j / audioContext.sampleRate)) * amplitude;
      }
    }
  }
  
  return buffer;
}

function generateWhooshSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 1.0;
  const totalSamples = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, totalSamples, audioContext.sampleRate);
  const channelData = buffer.getChannelData(0);
  
  const baseFreq = 300;
  
  for (let i = 0; i < totalSamples; i++) {
    const t = i / audioContext.sampleRate;
    const sweep = baseFreq * (1 - t/duration) * (1 - t/duration);
    
    // Create a whooshing noise effect
    channelData[i] = Math.sin(2 * Math.PI * sweep * t) * (1 - t/duration) * 0.5;
    // Add noise component
    channelData[i] += (Math.random() * 2 - 1) * 0.2 * (1 - t/duration);
  }
  
  return buffer;
}

function generateChimeSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 2.0;
  const totalSamples = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, totalSamples, audioContext.sampleRate);
  const channelData = buffer.getChannelData(0);
  
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (C major chord)
  
  for (let i = 0; i < totalSamples; i++) {
    const t = i / audioContext.sampleRate;
    let sample = 0;
    
    // Play each note in sequence
    for (let j = 0; j < notes.length; j++) {
      const noteStartTime = j * 0.15;
      if (t >= noteStartTime && t <= noteStartTime + 1.5) {
        const noteT = t - noteStartTime;
        const amplitude = Math.exp(-noteT * 2) * 0.25;
        sample += Math.sin(2 * Math.PI * notes[j] * noteT) * amplitude;
      }
    }
    
    channelData[i] = sample;
  }
  
  return buffer;
}

function generateMagicalSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 2.0;
  const totalSamples = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, totalSamples, audioContext.sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Magical harp-like sound with frequency sweeps
  for (let i = 0; i < totalSamples; i++) {
    const t = i / audioContext.sampleRate;
    let sample = 0;
    
    // Create a magical ascending arpeggio
    const baseFreq = 300;
    for (let j = 1; j <= 5; j++) {
      const noteStartTime = j * 0.2;
      if (t >= noteStartTime && t <= noteStartTime + 1.2) {
        const noteT = t - noteStartTime;
        const amplitude = Math.exp(-noteT * 3) * 0.2;
        const harmonic = baseFreq * j * 1.5;
        sample += Math.sin(2 * Math.PI * harmonic * noteT) * amplitude;
      }
    }
    
    // Add shimmer effect
    if (Math.random() < 0.02) {
      const shimmerDuration = 0.1;
      const shimmerFreq = 2000 + Math.random() * 6000;
      
      for (let j = 0; j < shimmerDuration * audioContext.sampleRate && i + j < totalSamples; j++) {
        const shimmerAmp = Math.exp(-j / (shimmerDuration * audioContext.sampleRate) * 10) * 0.1;
        channelData[i + j] += Math.sin(2 * Math.PI * shimmerFreq * (j / audioContext.sampleRate)) * shimmerAmp;
      }
    }
    
    channelData[i] += sample;
  }
  
  return buffer;
}

// Helper function to convert AudioBuffer to WAV format
function bufferToWav(buffer, opt) {
  opt = opt || {};

  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function encodeWAV(samples, format, sampleRate, numChannels, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, format, true);
  // Channel count
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, bitDepth, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, samples.length * bytesPerSample, true);

  if (format === 1) { // Raw PCM
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }

  return buffer;
}

function interleave(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeFloat32(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Generate all sound effects and provide download links
function generateAllSoundEffects() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const sparkleBuffer = generateSparkleSound();
  const whooshBuffer = generateWhooshSound();
  const chimeBuffer = generateChimeSound();
  const magicalBuffer = generateMagicalSound();
  
  const sparkleWav = bufferToWav(sparkleBuffer);
  const whooshWav = bufferToWav(whooshBuffer);
  const chimeWav = bufferToWav(chimeBuffer);
  const magicalWav = bufferToWav(magicalBuffer);
  
  // Create download links
  const sparkleBlob = new Blob([sparkleWav], { type: 'audio/wav' });
  const whooshBlob = new Blob([whooshWav], { type: 'audio/wav' });
  const chimeBlob = new Blob([chimeWav], { type: 'audio/wav' });
  const magicalBlob = new Blob([magicalWav], { type: 'audio/wav' });
  
  console.log('Sound effects generated! Use these links to download:');
  console.log('Sparkle:', URL.createObjectURL(sparkleBlob));
  console.log('Whoosh:', URL.createObjectURL(whooshBlob));
  console.log('Chime:', URL.createObjectURL(chimeBlob));
  console.log('Magical:', URL.createObjectURL(magicalBlob));
  
  // Play the sounds for preview
  function playBuffer(buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }
  
  console.log('Playing preview sounds...');
  setTimeout(() => playBuffer(sparkleBuffer), 0);
  setTimeout(() => playBuffer(whooshBuffer), 2000);
  setTimeout(() => playBuffer(chimeBuffer), 4000);
  setTimeout(() => playBuffer(magicalBuffer), 7000);
}

// Call this function to generate all sound effects
// generateAllSoundEffects();