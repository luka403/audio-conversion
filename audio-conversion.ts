import ffmpeg from 'fluent-ffmpeg';
import { Socket } from 'socket.io';
import { audioHandler, stopTranscriptionHandler } from './audio-handler';

const audioConversion = (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  let currentTranscription: any = null;

  socket.on('audio', (data: Buffer) => {
    try {
      // Convert WebM audio to PCM WAV format
      ffmpeg.input(data)
        .audioCodec('pcm_s16le')
        .format('wav')
        .on('data', (chunk: Buffer) => {
          audioHandler(socket, chunk);
        })
        .on('error', (error: Error) => {
          console.error(`Error converting audio: ${error.message}`);
          socket.emit('transcriptionError', { message: 'Error converting audio' });
        })
        .stream();
    } catch (error) {
      console.error(`Error processing audio: ${(error as Error).message}`);
      socket.emit('transcriptionError', { message: 'Error processing audio' });
    }
  });

  socket.on('stopTranscription', () => {
    stopTranscriptionHandler(socket);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (currentTranscription) {
      currentTranscription.end();
    }
  });
};

export default audioConversion;
