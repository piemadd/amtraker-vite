fetch('https://api.amtraker.com/v3/trains')
  .then(res => res.json())
  .then(data => {
    const updatedTimes = Object.values(data).flat().filter((train) => train.provider == 'Amtrak').map((train) => new Date(train.lastValTS).valueOf());
    const sortedUpdatedTimes = updatedTimes.sort().map((time) => new Date(time).toLocaleString());

    console.log(JSON.stringify(sortedUpdatedTimes, null, 2))
  })