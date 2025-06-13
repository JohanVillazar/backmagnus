import twilio from 'twilio';

const accountSid = 'AC88b61b4312f2732ddbd0e8e1eddebc7e'; // reemplaza con el tuyo
const authToken = '7442bdd12932b50e8af2411b88874554'; // reemplaza con el tuyo

const client = twilio(accountSid, authToken);

try {
  const message = await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+573027417279',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
    contentVariables: JSON.stringify({
      '1': '12/1',
      '2': '3pm',
    }),
  });

  console.log('Mensaje enviado con SID:', message.sid);
} catch (error) {
  console.error('Error enviando mensaje:', error);
}
