# Goal
A word-game environment to practice English vocabulary.

## Technical requirements
The game environment must be a client-side web application built with HTML, CSS, JS.

## Themes and styles
The overall styling and feel must be kid-friendly.

Design these three themes for the game backgrounds, assets, etc.:
- Sunny: nature themed, moderate bright outdoors.
- Space: outer space themed.
- Cute: cartoon themed, pastel colours.

Keep a theme chooser at one corner of the game interface.

## Overall game structure
- The game dashboard will have these sub-elements, all clickable to show overlays:
  - User profile: shows profile name, user scores for each game type
  - Game chooser: lets user choose a game type
  - Word list dialog: lets user upload a word list as knowledgebase
- On page load, the game dashboard will ask the user for a profile name, and then present a choice of games to the user.
- The word list dialog must let the user upload a .txt file containing a word list, with one word per line, that will act as the knowledge base of words for the current game session.
Use capital letters for words in the knowledgebase, and also in the game play.
- Each game must have a score counter display to display user scores for that game type.
- Scores for each profile name are tracked for each type of game.
- Score data must be persistent, it can be stored in local storage client-side, to keep track of profile game scores across sessions.
This allows the user to close the game session, and later start a new session but still see the scores for the user profiles.

## Word games:
Implement these games:

1. "Mix-up":
Show the jumbled letters of a word.
Let the user guess and type the correct word letter by letter.
As the user types letters, those letters are removed from the remaining letters available.
The user can use backspace to remove letters from the guess, and they are added back to the available letters.
When the user submits the guess, the game must tell if it is a correct guess or not.
The user may submit without guessing the full word, which shows the user resigned this round, then the correct word must be revealed.

2. "Blanked out":
Show a word with missing letters shown by blanks.
Let the user guess the missing letters, and type them one by one.
The user can type the missing letters in any order.
If the letter guessed is correct, show it in the word.
Once all letters are guessed, the user wins this round.
A wrong letter guess must show the user that the guess is wrong.
The user is allowed five wrong guesses, after which the user loses the round.

## Scoring:
- Each round won adds 1 point to the user profile's score for the particular game type, and each lost round deducts 1 point.
