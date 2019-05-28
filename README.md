## Simple JS/Node Developer Challenge
### Idea
hashmap algorithm have been implemented, I used a very naive approach simple enough for a demo.
current hash function doesn't improve search neither minimise collision intentionally to test collsions.
further optimisations are trivial to implement (in memory cache and chunks).

### Testing
`node test`

### Goal
Clone this repo and build a simple dictionary key/value store script using only core NodeAPI and ECMAScript 5 or 6.  (Es6) was used 
Store the key/value dictionary using filesystem.
The client should be a standalone terminal tool.
Commit and track your work history in a new GitLab repo. Once finished email the link to your repo.

### Store Commands

`$ node store.js add mykey myvalue`

`$ node store.js list`

`$ node store.js get mykey`

`$ node store.js remove mykey`

`$ node store.js clear`

### Bonus

- Write clean, modular and testable code. (done)
- Instead of running `node store.js` alter the runtime so it can be run as `./store`. (done)
- Add ability to deploy in Docker container. (done)
