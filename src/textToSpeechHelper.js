const lib = require('@google-cloud/text-to-speech');
const validationHelper = require('./validationHelper');

const client = new lib.TextToSpeechClient();
const textToSpeech = async ({ text, voice }) => {
    validationHelper.throwErrorIfFieldNotProvided(text, 'text');
    const { langCode, voiceName, voiceGender } = voice;
    validationHelper.throwErrorIfFieldNotProvided(langCode, 'langCode');
    validationHelper.throwErrorIfFieldNotProvided(voiceName, 'voiceName');
    validationHelper.throwErrorIfFieldNotProvided(voiceGender, 'voiceGender');
    const request = {
        input: {
            text,
        },
        voice: {
            languageCode: langCode,
            name: voiceName,
            ssmlGender: voiceGender,
        },
        audioConfig: { audioEncoding: 'MP3' },
    };
    return client.synthesizeSpeech(request);
};

module.exports = {
    textToSpeech,
};
