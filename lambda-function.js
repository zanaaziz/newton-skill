var https = require('https')

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Mr. Newton says hello, if you have any calculus problems, tell me and I'll ask him.", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {

            case "FindDerivative":
              if(event.request.intent.slots.dBaseTwo.value != null && event.request.intent.slots.exponentTwo.value != null){
                  var endpoint = `https://newton.now.sh/derive/${event.request.intent.slots.dBaseOne.value}^${event.request.intent.slots.exponentOne.value}+${event.request.intent.slots.dBaseTwo.value}^${event.request.intent.slots.exponentTwo.value}`;
              }else{
                  if(event.request.intent.slots.exponentOne.value == null && event.request.intent.slots.exponentTwo.value != null){
                    event.request.intent.slots.exponentOne.value = event.request.intent.slots.exponentTwo.value;
                    event.request.intent.slots.exponentTwo.value = null;
                  }
                  var endpoint = `https://newton.now.sh/derive/${event.request.intent.slots.dBaseOne.value}^${event.request.intent.slots.exponentOne.value}`;
              }

              var body = ""
              https.get(endpoint, (response) => {
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                  var data = JSON.parse(body)
                  var expression = JSON.stringify(data.expression);
                  var result = JSON.stringify(data.result);
                  context.succeed(
                    generateResponse(
                      buildSpeechletResponse(`The answer is ${result}`, true),
                      {}
                    )
                  );
                });
              });
              break;

            case "FindLogarithm":
            var endpoint2 = `https://newton.now.sh/log/${event.request.intent.slots.log.value}|${event.request.intent.slots.lBase.value}`
            var body2 = ""
            https.get(endpoint2, (response) => {
              response.on('data', (chunk) => { body2 += chunk })
              response.on('end', () => {
                var data = JSON.parse(body2)
                var result = JSON.stringify(data.result);
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`The answer is ${result}`, true),
                    {}
                  )
                );
              });
            });
            break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}
