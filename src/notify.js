  const sms = c.status === 'Resolved'
    ? await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: body,
          numbers: phone.slice(-10),
          flash: 0,
        }),
      }).then((r) => r.json())
    : { message: 'SMS is sent only when Resolved' }