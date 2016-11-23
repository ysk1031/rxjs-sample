import $ from 'jquery';
import Rx from 'rx';

const refreshClickStream = Rx.Observable.fromEvent($('.refresh'), 'click');

const requestStream = refreshClickStream.startWith('startup click')
  .map(() => {
    const randomOffset = Math.floor(Math.random() * 500);
    return `https://api.github.com/users?since=${randomOffset}`;
  });

const responseStream = requestStream
  .flatMap(requestUrl => Rx.Observable.fromPromise($.getJSON(requestUrl)));

const close1ClickStream = streamByCloseClick('.close1');
const close2ClickStream = streamByCloseClick('.close2');
const close3ClickStream = streamByCloseClick('.close3');

const suggestion1Stream = suggestionStream(close1ClickStream);
const suggestion2Stream = suggestionStream(close2ClickStream);
const suggestion3Stream = suggestionStream(close3ClickStream);

suggestion1Stream.subscribe(suggestedUser => {
  renderSuggestion(suggestedUser, '.suggestion1');
});
suggestion2Stream.subscribe(suggestedUser => {
  renderSuggestion(suggestedUser, '.suggestion2');
});
suggestion3Stream.subscribe(suggestedUser => {
  renderSuggestion(suggestedUser, '.suggestion3');
});


function streamByCloseClick(selector) {
  return Rx.Observable.fromEvent($(selector), 'click');
}

function suggestionStream(closeClickStream) {
  return closeClickStream.startWith('startup click')
    .combineLatest(responseStream, (_, listUsers) => {
      return listUsers[Math.floor(Math.random() * listUsers.length)];
    })
    .merge(refreshClickStream.map(() => null))
    .startWith(null);
}

function renderSuggestion(suggestedUser, selector) {
  const suggesttionEl = document.querySelector(selector);
  if (suggestedUser == null) {
    suggesttionEl.style.visibility = 'hidden';
  } else {
    suggesttionEl.style.visibility = 'visible';

    const userNameEl = suggesttionEl.querySelector('.username');
    userNameEl.href = suggestedUser.html_url;
    userNameEl.textContent = suggestedUser.login;
    const imgEl = suggesttionEl.querySelector('img');
    imgEl.src = "";
    imgEl.src = suggestedUser.avatar_url;
  }
}
