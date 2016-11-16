import $ from 'jquery';
import Rx from 'rx';

const inputStream = Rx.Observable.fromEvent($('#query'), 'input')
  .map(e => e.target.value);

// const queryStream = inputStream
//   .filter(text => text.length > 0)
//   .map(text => `https://api.github.com/search/repositories?q=${text}`);

const queryStream = inputStream
  .throttle(300)
  .filter(text => text.length > 0)
  .distinctUntilChanged()
  .map(text => `https://api.github.com/search/repositories?q=${text}`);

// const query = `https://api.github.com/search/repositories?q=${text}`;
// Rx.Observable.fromPromise($.ajax({url: query}));

const repositoriesStream = queryStream
  .flatMap((query) => {
    const promise = $.ajax({url: query});
    return Rx.Observable.fromPromise(promise);
  })
  .map(res => res.items);

const htmlStream = repositoriesStream
  .map((items) => {
    return items.map((repo) => {
      const $p = $('<p>').append(
        $('<a>').attr({href: repo.html_url}).append(repo.description)
      );
      return $p[0].outerHTML;
    });
  });

htmlStream.subscribe((htmlParts) => {
  $('#search-result').empty();
  const $table = $('<table>');
  $.each(htmlParts, (_, html) => {
    $table.append($('<tr>').append($('<td>').append(html)));
  });
  $('#search-result').append($table);
});
