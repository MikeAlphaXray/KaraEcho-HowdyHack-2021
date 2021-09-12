/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');

const STREAMS = [
  {
    'token': 'dabble-radio-1',
    'url': 'https://dl119.youtubetomp3music.com/file/youtubekUsFWO08CO0128.mp3?fn=TOP%20GUN%20-DANGER%20ZONE%20%20(Music%20Video).mp3',
    'metadata': {
      'title': 'Kara Echo',
      'subtitle': 'Music for coders',
      'art': {
        'sources': [
          {
            'contentDescription': 'Kara Echo',
            'url': 'https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png',
            'widthPixels': 512,
            'heightPixels': 512,
          },
        ],
      },
      'backgroundImage': {
        'sources': [
          {
            'contentDescription': 'Kara Echo',
            'url': 'https://s3.amazonaws.com/cdn.dabblelab.com/img/wayfarer-on-beach-1200x800.png',
            'widthPixels': 1200,
            'heightPixels': 800,
          },
        ],
      },
    },
  },
];

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StartKaraokeIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'Welcome to Kara Echo. What song do you want to play?';
    console.log(handlerInput.requestEnvelope.request.intent);
    try {
        if (!(handlerInput.requestEnvelope.request.type === "LaunchRequest")) {
          const keywords = handlerInput.requestEnvelope.request.intent.slots.SongName.value;
          if (!keywords) {
              return handlerInput.responseBuilder
                .speak("Could not understand your song request.")
                .getResponse();
          }
    
          try {
            const response = await getRemoteData(`https://howdyhackgcp.com/mp3?kwds=${encodeURIComponent(keywords)}`);
            if (response.processing) {
                return handlerInput.responseBuilder
                    .speak("Your karaoke is being prepared")
                    .getResponse();
            }
            console.log(response);
            const stream = STREAMS[0];
            stream.token = `kara-eco-${Math.random().toString().replace(/\./g, '')}`;
            stream.url = `https://howdyhackgcp.com/getmp3?name=${response.name}`;
            stream.metadata.title = response.title;
            stream.metadata.subtitle = response.artist_name;

            console.log(stream);
            handlerInput.responseBuilder
              .speak(`starting ${stream.metadata.title} by ${response.artist_name}`)
              .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);
          } catch (error) {
            handlerInput.responseBuilder
              .speak(`There was an error in the server response. ${error}`);
          }
    
          return handlerInput.responseBuilder
            .getResponse();
        }
    } catch (error) {
        console.log(error);
        outputSpeech = "There was an error: " + error.toString();
    }

    // return handlerInput.responseBuilder
    //   .addDirective({
    //         type: 'Dialog.ElicitSlot',
    //         slotToElicit: 'SongName',
    //         updatedIntent: {
    //             name: 'GetRemoteDataIntent',
    //             confirmationStatus: 'NONE'
    //         }
    //     })
    //   .speak(outputSpeech)
    //   .reprompt(outputSpeech)
    //   .getResponse();
    return handlerInput.responseBuilder
    // .addElicitSlotDirective('SongName', {
    //     name: 'StartKaraokeIntent',
    //     confirmationStatus: 'NONE',
    //     slots: {}
    // })
    .speak("It was a launch request")

    // .reprompt("What would you like to play?")
    .getResponse();
  },
};

const a = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
    
      return request.type === 'LaunchRequest';
    },
    handle: function(handlerInput) {
      return handlerInput.responseBuilder
        .addElicitSlotDirective('SongName', {
          name: 'StartKaraokeIntent',
          confirmationStatus: 'NONE'
        })
        .speak("Welcome to Kara Echo. What would you like to play?")
        .reprompt("What would you like to play?")
        .getResponse();
    }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    let speaktext = `Sorry, there was an error: ${error.message}`

    return handlerInput.responseBuilder
      .speak(speaktext)
      .reprompt(speaktext)
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued'
      || handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

// const PlaybackStartedIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
//   },
//   handle(handlerInput) {
//     handlerInput.responseBuilder
//       .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

//     return handlerInput.responseBuilder
//       .getResponse();
//   },
// };


function getRemoteData(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed with status code: ${response.statusCode}`));
      }
      const body = [];
      response.on('data', (chunk) => {
          try {
              body.push(chunk)
          } catch (err) {
              console.log(err);
              reject(err);
          }
      });
      response.on('end', () => {
        try {
          const res = JSON.parse(body.join(''));
          resolve(res);
        } catch (err) {
          console.error(`Failed to parse JSON: ${body}`);
          reject(`Failed to parse JSON: ${body}`);
        }
      });
    });
    request.on('error', (err) => reject(err));
  });
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    a,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    PlaybackStoppedIntentHandler,
    // PlaybackStartedIntentHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
