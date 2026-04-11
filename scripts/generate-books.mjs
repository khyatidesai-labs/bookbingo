// scripts/generate-books.mjs
// Generates src/data/books.ts AND supabase/books_seed.sql from a single
// curated pipe-delimited catalogue. Re-run with `node scripts/generate-books.mjs`.
//
// Format: title|author|year|pages|moods|professions|genres|tags
//   moods       ∈ feel-good | dark-deep | motivational | romantic | mind-bending
//   professions ∈ designer | developer | entrepreneur | lawyer | doctor | educator | scientist
//   genres,tags: free-form, comma-separated
//
// Why one generator: we need the same ~500 rows in TypeScript (app read-path)
// and in SQL (Supabase seed). Authoring twice would drift; this stays tidy.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RAW = `
Atomic Habits|James Clear|2018|320|motivational,feel-good|designer,developer,entrepreneur,educator,lawyer,doctor,scientist|Self-Help,Productivity|bestseller,non-fiction,award-winner,short
The Pragmatic Programmer|David Thomas|1999|352|motivational,mind-bending|developer|Software,Craft|classic,non-fiction,technical
Clean Code|Robert C. Martin|2008|464|motivational,mind-bending|developer|Software,Craft|non-fiction,technical
Code Complete|Steve McConnell|2004|960|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
Refactoring|Martin Fowler|2018|448|motivational,mind-bending|developer|Software,Craft|non-fiction,technical
Design Patterns|Erich Gamma|1994|395|mind-bending|developer|Software,Craft|classic,non-fiction,technical
The Mythical Man-Month|Fred Brooks|1975|322|mind-bending|developer,entrepreneur|Software,Essays|classic,non-fiction,technical
Structure and Interpretation of Computer Programs|Harold Abelson|1984|657|mind-bending|developer,scientist|Computer Science,Craft|classic,non-fiction,technical,chunky
The C Programming Language|Brian Kernighan|1988|272|mind-bending|developer|Software,Craft|classic,non-fiction,technical,short
Introduction to Algorithms|Thomas H. Cormen|2009|1312|mind-bending|developer,scientist|Computer Science,Algorithms|classic,non-fiction,technical,chunky
The Art of Computer Programming Volume 1|Donald Knuth|1997|650|mind-bending|developer,scientist|Computer Science,Algorithms|classic,non-fiction,technical,chunky
Godel Escher Bach|Douglas Hofstadter|1979|777|mind-bending|developer,scientist|Philosophy,Computer Science|classic,non-fiction,award-winner,chunky
Cracking the Coding Interview|Gayle Laakmann McDowell|2015|696|motivational,mind-bending|developer|Software,Craft|non-fiction,technical,chunky
Effective Java|Joshua Bloch|2017|416|mind-bending|developer|Software,Craft|non-fiction,technical
Java Concurrency in Practice|Brian Goetz|2006|384|mind-bending|developer|Software,Craft|non-fiction,technical
JavaScript The Good Parts|Douglas Crockford|2008|172|mind-bending|developer|Software,Craft|non-fiction,technical,short
You Don't Know JS|Kyle Simpson|2015|278|mind-bending|developer|Software,Craft|non-fiction,technical,short
Eloquent JavaScript|Marijn Haverbeke|2018|472|mind-bending|developer|Software,Craft|non-fiction,technical
Fluent Python|Luciano Ramalho|2015|770|mind-bending|developer,scientist|Software,Craft|non-fiction,technical,chunky
Python Crash Course|Eric Matthes|2015|560|motivational|developer,scientist|Software,Craft|non-fiction,technical
Learning Python|Mark Lutz|2013|1594|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
The Rust Programming Language|Steve Klabnik|2019|560|mind-bending|developer|Software,Craft|non-fiction,technical
Programming Rust|Jim Blandy|2021|735|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
The Go Programming Language|Alan Donovan|2015|380|mind-bending|developer|Software,Craft|non-fiction,technical
Programming Elixir|Dave Thomas|2018|410|mind-bending|developer|Software,Craft|non-fiction,technical
Practical Object-Oriented Design in Ruby|Sandi Metz|2018|288|mind-bending|developer|Software,Craft|non-fiction,technical,short
Metaprogramming Ruby|Paolo Perrotta|2014|294|mind-bending|developer|Software,Craft|non-fiction,technical,short
Algorithms|Robert Sedgewick|2011|976|mind-bending|developer,scientist|Computer Science,Algorithms|non-fiction,technical,chunky
Hackers and Painters|Paul Graham|2004|272|motivational,mind-bending|developer,entrepreneur|Essays,Software|non-fiction,short
Peopleware|Tom DeMarco|2013|256|motivational|developer|Software,Management|classic,non-fiction,short
Team Geek|Brian Fitzpatrick|2012|194|motivational,feel-good|developer|Software,Management|non-fiction,short
The Phoenix Project|Gene Kim|2013|432|motivational|developer,entrepreneur|Software,Management|bestseller,non-fiction
The Unicorn Project|Gene Kim|2019|352|motivational|developer,entrepreneur|Software,Management|bestseller,non-fiction
Accelerate|Nicole Forsgren|2018|288|motivational,mind-bending|developer,entrepreneur|Software,Management|non-fiction,short
Continuous Delivery|Jez Humble|2010|512|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
Site Reliability Engineering|Google|2016|550|mind-bending|developer|Software,Management|non-fiction,technical,chunky
Designing Data-Intensive Applications|Martin Kleppmann|2017|616|mind-bending|developer|Software,Architecture|bestseller,non-fiction,technical,chunky
Building Microservices|Sam Newman|2015|280|mind-bending|developer|Software,Architecture|non-fiction,technical,short
Domain-Driven Design|Eric Evans|2003|560|mind-bending|developer|Software,Architecture|non-fiction,technical,chunky
Clean Architecture|Robert C. Martin|2017|432|mind-bending|developer|Software,Architecture|non-fiction,technical
The Clean Coder|Robert C. Martin|2011|256|motivational|developer|Software,Craft|non-fiction,short
Working Effectively with Legacy Code|Michael Feathers|2004|456|mind-bending|developer|Software,Craft|non-fiction,technical
Test-Driven Development|Kent Beck|2002|240|mind-bending|developer|Software,Craft|classic,non-fiction,technical,short
The Soul of a New Machine|Tracy Kidder|1981|293|motivational,mind-bending|developer,scientist|History,Software|classic,non-fiction,award-winner,short
Just for Fun|Linus Torvalds|2001|288|feel-good,motivational|developer|Memoir,Software|memoir,non-fiction,short
Coders at Work|Peter Seibel|2009|632|motivational,mind-bending|developer|Software,Interviews|non-fiction,chunky
The Passionate Programmer|Chad Fowler|2009|200|motivational|developer|Software,Career|non-fiction,short
Operating Systems Three Easy Pieces|Remzi Arpaci-Dusseau|2018|714|mind-bending|developer,scientist|Computer Science,Systems|non-fiction,technical,chunky
Computer Networks|Andrew Tanenbaum|2010|960|mind-bending|developer,scientist|Computer Science,Systems|non-fiction,technical,chunky
Computer Systems A Programmers Perspective|Randal Bryant|2015|1120|mind-bending|developer,scientist|Computer Science,Systems|non-fiction,technical,chunky
Compilers Principles Techniques and Tools|Alfred Aho|2006|1000|mind-bending|developer,scientist|Computer Science,Craft|non-fiction,technical,chunky
Types and Programming Languages|Benjamin Pierce|2002|648|mind-bending|developer,scientist|Computer Science,Craft|non-fiction,technical,chunky
Purely Functional Data Structures|Chris Okasaki|1999|220|mind-bending|developer,scientist|Computer Science,Craft|non-fiction,technical,short
Real World Haskell|Bryan OSullivan|2008|710|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
Programming in Scala|Martin Odersky|2016|859|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
Software Engineering at Google|Titus Winters|2020|599|mind-bending|developer|Software,Management|non-fiction,technical,chunky
A Philosophy of Software Design|John Ousterhout|2018|178|mind-bending|developer|Software,Craft|non-fiction,technical,short
Pragmatic Thinking and Learning|Andy Hunt|2008|288|motivational,mind-bending|developer,educator|Software,Learning|non-fiction,short
Release It|Michael Nygard|2018|360|mind-bending|developer|Software,Architecture|non-fiction,technical
High Performance Browser Networking|Ilya Grigorik|2013|400|mind-bending|developer|Software,Web|non-fiction,technical
HTTP The Definitive Guide|David Gourley|2002|656|mind-bending|developer|Software,Web|non-fiction,technical,chunky
Dont Make Me Think|Steve Krug|2014|216|motivational,mind-bending|designer,developer|Design,Usability|classic,non-fiction,short
Learning Web Design|Jennifer Robbins|2018|808|motivational|designer,developer|Design,Web|non-fiction,technical,chunky
CSS The Definitive Guide|Eric Meyer|2017|1088|mind-bending|designer,developer|Design,Web|non-fiction,technical,chunky
Node.js Design Patterns|Mario Casciaro|2020|660|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
The Cathedral and the Bazaar|Eric S. Raymond|2001|241|motivational,mind-bending|developer|Essays,Software|classic,non-fiction,short
Producing Open Source Software|Karl Fogel|2005|300|motivational|developer|Software,Management|non-fiction,short
Pro Git|Scott Chacon|2014|456|mind-bending|developer|Software,Craft|non-fiction,technical
Dreaming in Code|Scott Rosenberg|2007|416|mind-bending|developer|History,Software|non-fiction
Masters of Doom|David Kushner|2003|339|feel-good,motivational|developer,entrepreneur|Biography,Gaming|bestseller,non-fiction
The Art of Unix Programming|Eric S. Raymond|2003|560|mind-bending|developer|Software,Craft|non-fiction,technical,chunky
Beautiful Code|Andy Oram|2007|618|mind-bending|developer|Essays,Software|non-fiction,chunky
The Design of the UNIX Operating System|Maurice Bach|1986|471|mind-bending|developer,scientist|Systems,Software|classic,non-fiction,technical
The Annotated Turing|Charles Petzold|2008|372|mind-bending|developer,scientist|Computer Science,History|non-fiction
CODE The Hidden Language|Charles Petzold|2000|400|mind-bending|developer,scientist,educator|Computer Science,History|classic,non-fiction
Hackers Heroes of the Computer Revolution|Steven Levy|1984|528|motivational,mind-bending|developer|History,Biography|classic,non-fiction,chunky
Show Stopper|G. Pascal Zachary|1994|336|motivational|developer|History,Software|non-fiction
Understanding Distributed Systems|Roberto Vitillo|2021|260|mind-bending|developer|Software,Architecture|non-fiction,technical,short
The Staff Engineers Path|Tanya Reilly|2022|375|motivational,mind-bending|developer|Software,Career|non-fiction
Staff Engineer|Will Larson|2021|278|motivational|developer|Software,Career|non-fiction,short
An Elegant Puzzle|Will Larson|2019|278|motivational,mind-bending|developer,entrepreneur|Management,Software|non-fiction,short
The Managers Path|Camille Fournier|2017|244|motivational|developer,entrepreneur|Management,Software|non-fiction,short
Resilient Management|Lara Hogan|2019|124|motivational|developer,entrepreneur|Management,Software|non-fiction,short
The Effective Engineer|Edmond Lau|2015|242|motivational|developer|Software,Career|non-fiction,short
Ask Your Developer|Jeff Lawson|2021|272|motivational|developer,entrepreneur|Business,Software|non-fiction,short
Tidy First|Kent Beck|2023|128|mind-bending|developer|Software,Craft|non-fiction,technical,short
The Design of Everyday Things|Don Norman|1988|368|mind-bending,motivational|designer,developer,educator|Design,Psychology|classic,non-fiction,award-winner
Grid Systems in Graphic Design|Josef Muller-Brockmann|1981|176|mind-bending|designer|Design,Typography|classic,non-fiction,short
The Elements of Typographic Style|Robert Bringhurst|2012|384|mind-bending|designer|Design,Typography|classic,non-fiction
Interaction of Color|Josef Albers|1963|208|mind-bending|designer,scientist|Design,Art|classic,non-fiction,short
Thinking with Type|Ellen Lupton|2010|224|mind-bending|designer|Design,Typography|non-fiction,short
Logo Modernism|Jens Muller|2015|432|mind-bending|designer|Design,History|non-fiction
A History of Graphic Design|Philip Meggs|2016|608|mind-bending|designer,educator|Design,History|non-fiction,chunky
Designing Interfaces|Jenifer Tidwell|2020|600|mind-bending|designer,developer|Design,UX|non-fiction,technical,chunky
About Face|Alan Cooper|2014|720|mind-bending|designer,developer|Design,UX|non-fiction,technical,chunky
Hooked|Nir Eyal|2014|240|mind-bending,motivational|designer,entrepreneur|Design,Business|bestseller,non-fiction,short
Seductive Interaction Design|Stephen Anderson|2011|240|mind-bending|designer|Design,UX|non-fiction,short
100 Things Every Designer Needs to Know About People|Susan Weinschenk|2011|256|mind-bending|designer,educator|Design,Psychology|non-fiction,short
Universal Principles of Design|William Lidwell|2010|272|mind-bending|designer|Design,Reference|non-fiction,short
Designing for Emotion|Aarron Walter|2011|112|mind-bending,feel-good|designer|Design,UX|non-fiction,short
Mobile First|Luke Wroblewski|2011|123|mind-bending|designer,developer|Design,Web|non-fiction,short
Responsive Web Design|Ethan Marcotte|2014|153|mind-bending|designer,developer|Design,Web|non-fiction,short
Atomic Design|Brad Frost|2016|200|mind-bending|designer,developer|Design,Web|non-fiction,short
Design Systems|Alla Kholmatova|2017|180|mind-bending|designer,developer|Design,Web|non-fiction,short
Designing Design|Kenya Hara|2007|467|mind-bending|designer|Design,Philosophy|non-fiction
The Art of Looking Sideways|Alan Fletcher|2001|1068|mind-bending,feel-good|designer|Design,Art|classic,non-fiction,chunky
Ways of Seeing|John Berger|1972|166|mind-bending|designer,educator|Art,Essays|classic,non-fiction,short
Visual Thinking|Rudolf Arnheim|1969|345|mind-bending|designer,educator|Psychology,Art|classic,non-fiction
The Back of the Napkin|Dan Roam|2009|304|mind-bending,motivational|designer,entrepreneur|Design,Business|non-fiction
Sketching User Experiences|Bill Buxton|2007|448|mind-bending|designer|Design,UX|non-fiction
Steal Like an Artist|Austin Kleon|2012|160|motivational,feel-good|designer,entrepreneur|Creativity,Art|bestseller,non-fiction,short
Show Your Work|Austin Kleon|2014|224|motivational,feel-good|designer,entrepreneur|Creativity,Art|bestseller,non-fiction,short
Make Your Mark|Jocelyn K. Glei|2014|288|motivational|designer,entrepreneur|Creativity,Business|non-fiction,short
Emotional Design|Don Norman|2005|272|mind-bending|designer,developer|Design,Psychology|non-fiction,short
Creative Confidence|Tom Kelley|2013|288|motivational,feel-good|designer,entrepreneur,educator|Creativity,Business|bestseller,non-fiction,short
Change by Design|Tim Brown|2009|272|motivational,mind-bending|designer,entrepreneur|Design,Business|non-fiction,short
The Art of Innovation|Tom Kelley|2001|320|motivational|designer,entrepreneur|Design,Business|non-fiction
The Ten Faces of Innovation|Tom Kelley|2005|288|motivational|designer,entrepreneur|Design,Business|non-fiction,short
Paul Rand A Designers Art|Paul Rand|1985|240|mind-bending|designer|Design,Art|classic,non-fiction,short
Designing Your Life|Bill Burnett|2016|238|motivational,feel-good|designer,educator|Self-Help,Design|bestseller,non-fiction,short
The Shape of Design|Frank Chimero|2012|148|mind-bending,feel-good|designer|Design,Philosophy|non-fiction,short
Hello World Where Design Meets Life|Alice Rawsthorn|2014|272|mind-bending|designer|Design,Essays|non-fiction,short
Badass Making Users Awesome|Kathy Sierra|2015|304|motivational,mind-bending|designer,educator|Design,UX|non-fiction
Rocket Surgery Made Easy|Steve Krug|2009|168|mind-bending|designer,developer|Design,UX|non-fiction,short
The Visual Display of Quantitative Information|Edward Tufte|2001|200|mind-bending|designer,scientist,educator|Design,Data|classic,non-fiction,award-winner,short
Envisioning Information|Edward Tufte|1990|126|mind-bending|designer,scientist,educator|Design,Data|classic,non-fiction,award-winner,short
Visual Explanations|Edward Tufte|1997|156|mind-bending|designer,scientist,educator|Design,Data|non-fiction,short
Beautiful Evidence|Edward Tufte|2006|213|mind-bending|designer,scientist,educator|Design,Data|non-fiction,short
Information Graphics|Sandra Rendgen|2012|480|mind-bending|designer,scientist|Design,Data|non-fiction
Now You See It|Stephen Few|2009|328|mind-bending|designer,scientist|Design,Data|non-fiction
Show Me the Numbers|Stephen Few|2012|364|mind-bending|designer,scientist|Design,Data|non-fiction
Refactoring UI|Adam Wathan|2018|234|mind-bending|designer,developer|Design,Web|non-fiction,short
Typography Essentials|Ina Saltz|2019|240|mind-bending|designer|Design,Typography|non-fiction,short
Grid Systems|Kimberly Elam|2004|120|mind-bending|designer|Design,Typography|non-fiction,short
Sprint|Jake Knapp|2016|288|motivational|designer,entrepreneur|Design,Business|bestseller,non-fiction,short
Inspired|Marty Cagan|2017|368|motivational|designer,entrepreneur|Design,Business|non-fiction
Empowered|Marty Cagan|2020|400|motivational|designer,entrepreneur|Design,Business|non-fiction
Continuous Discovery Habits|Teresa Torres|2021|222|motivational|designer,entrepreneur|Design,Business|non-fiction,short
Articulating Design Decisions|Tom Greever|2020|338|motivational|designer|Design,UX|non-fiction
Meaningful|Bernadette Jiwa|2015|214|motivational|designer,entrepreneur|Business,Design|non-fiction,short
Zero to One|Peter Thiel|2014|224|motivational,mind-bending|entrepreneur,developer|Business,Startup|bestseller,non-fiction,short
The Lean Startup|Eric Ries|2011|336|motivational|entrepreneur|Business,Startup|bestseller,non-fiction
The Hard Thing About Hard Things|Ben Horowitz|2014|304|motivational,dark-deep|entrepreneur|Business,Startup|bestseller,non-fiction
Good to Great|Jim Collins|2001|320|motivational|entrepreneur|Business|bestseller,non-fiction
Built to Last|Jim Collins|1994|368|motivational|entrepreneur|Business|bestseller,non-fiction
The Innovators Dilemma|Clayton Christensen|1997|286|mind-bending|entrepreneur|Business|classic,non-fiction,short
Crossing the Chasm|Geoffrey Moore|1991|288|mind-bending|entrepreneur|Business,Marketing|classic,non-fiction,short
Rework|Jason Fried|2010|288|motivational,feel-good|entrepreneur|Business,Startup|bestseller,non-fiction,short
Remote|Jason Fried|2013|256|motivational|entrepreneur|Business,Work|non-fiction,short
It Doesnt Have to Be Crazy at Work|Jason Fried|2018|240|motivational,feel-good|entrepreneur|Business,Work|non-fiction,short
The 100 Dollar Startup|Chris Guillebeau|2012|304|motivational,feel-good|entrepreneur|Business,Startup|bestseller,non-fiction
The 4 Hour Workweek|Tim Ferriss|2007|416|motivational|entrepreneur|Self-Help,Business|bestseller,non-fiction
Deep Work|Cal Newport|2016|304|motivational|entrepreneur,educator,scientist,developer|Self-Help,Productivity|bestseller,non-fiction
The E-Myth Revisited|Michael Gerber|1995|288|motivational|entrepreneur|Business|classic,non-fiction,short
The Goal|Eliyahu Goldratt|1984|384|motivational|entrepreneur|Business,Fiction|classic,fiction
Traction|Gabriel Weinberg|2015|248|motivational|entrepreneur|Business,Marketing|non-fiction,short
Blitzscaling|Reid Hoffman|2018|336|motivational|entrepreneur|Business,Startup|non-fiction
Founders at Work|Jessica Livingston|2008|488|motivational|entrepreneur,developer|Business,Interviews|non-fiction
Shoe Dog|Phil Knight|2016|400|motivational,feel-good|entrepreneur|Memoir,Business|memoir,bestseller,non-fiction
Losing My Virginity|Richard Branson|1998|608|motivational,feel-good|entrepreneur|Memoir,Business|memoir,non-fiction,chunky
Delivering Happiness|Tony Hsieh|2010|272|motivational,feel-good|entrepreneur|Memoir,Business|memoir,non-fiction,short
Onward|Howard Schultz|2011|368|motivational|entrepreneur|Memoir,Business|memoir,non-fiction
Pour Your Heart Into It|Howard Schultz|1997|368|motivational|entrepreneur|Memoir,Business|memoir,non-fiction
Grinding It Out|Ray Kroc|1977|224|motivational|entrepreneur|Memoir,Business|classic,memoir,non-fiction,short
Sam Walton Made in America|Sam Walton|1992|346|motivational|entrepreneur|Memoir,Business|classic,memoir,non-fiction
Only the Paranoid Survive|Andrew Grove|1996|240|motivational,dark-deep|entrepreneur|Business,Management|classic,non-fiction,short
How to Win Friends and Influence People|Dale Carnegie|1936|291|motivational,feel-good|entrepreneur,educator|Self-Help|classic,bestseller,non-fiction,short
Think and Grow Rich|Napoleon Hill|1937|238|motivational|entrepreneur|Self-Help|classic,bestseller,non-fiction,short
Rich Dad Poor Dad|Robert Kiyosaki|1997|336|motivational|entrepreneur|Finance,Self-Help|bestseller,non-fiction
The Intelligent Investor|Benjamin Graham|1949|640|mind-bending|entrepreneur|Finance|classic,non-fiction,chunky
The Richest Man in Babylon|George S. Clason|1926|144|motivational|entrepreneur|Finance|classic,non-fiction,short
The 7 Habits of Highly Effective People|Stephen Covey|1989|381|motivational|entrepreneur,educator|Self-Help|classic,bestseller,non-fiction
The One Thing|Gary Keller|2013|240|motivational|entrepreneur|Self-Help,Productivity|bestseller,non-fiction,short
Eat That Frog|Brian Tracy|2001|128|motivational|entrepreneur|Self-Help,Productivity|non-fiction,short
Mastery|Robert Greene|2012|368|motivational,mind-bending|entrepreneur,educator|Self-Help,Psychology|non-fiction
Outliers|Malcolm Gladwell|2008|309|mind-bending|entrepreneur,educator,scientist|Psychology,Business|bestseller,non-fiction
Start with Why|Simon Sinek|2009|256|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction,short
Leaders Eat Last|Simon Sinek|2014|368|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction
Drive|Daniel Pink|2009|272|motivational,mind-bending|entrepreneur,educator|Psychology,Business|bestseller,non-fiction,short
Principles|Ray Dalio|2017|592|motivational,mind-bending|entrepreneur|Memoir,Business|bestseller,memoir,non-fiction,chunky
Skin in the Game|Nassim Taleb|2018|304|mind-bending|entrepreneur,scientist|Philosophy,Business|non-fiction
Antifragile|Nassim Taleb|2012|519|mind-bending|entrepreneur,scientist|Philosophy,Business|non-fiction,chunky
The Black Swan|Nassim Taleb|2007|400|mind-bending|entrepreneur,scientist|Philosophy,Business|bestseller,non-fiction
Fooled by Randomness|Nassim Taleb|2001|316|mind-bending|entrepreneur,scientist|Philosophy,Finance|non-fiction
Thinking Fast and Slow|Daniel Kahneman|2011|499|mind-bending|entrepreneur,educator,scientist|Psychology|bestseller,non-fiction,award-winner
Predictably Irrational|Dan Ariely|2008|280|mind-bending|entrepreneur,educator,scientist|Psychology|bestseller,non-fiction,short
Influence|Robert Cialdini|1984|336|mind-bending|entrepreneur,educator|Psychology|classic,non-fiction
Pre-Suasion|Robert Cialdini|2016|432|mind-bending|entrepreneur|Psychology|non-fiction
Never Split the Difference|Chris Voss|2016|288|motivational|entrepreneur,lawyer|Business,Negotiation|bestseller,non-fiction,short
Crucial Conversations|Kerry Patterson|2011|240|motivational|entrepreneur,educator|Self-Help|non-fiction,short
Getting to Yes|Roger Fisher|1981|240|motivational|entrepreneur,lawyer|Business,Negotiation|classic,non-fiction,short
The First 90 Days|Michael Watkins|2013|304|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction
The Culture Code|Daniel Coyle|2018|304|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction
An Everyone Culture|Robert Kegan|2016|320|motivational|entrepreneur|Business,Leadership|non-fiction
No Rules Rules|Reed Hastings|2020|320|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction
Powerful|Patty McCord|2018|224|motivational|entrepreneur|Business,Leadership|non-fiction,short
Radical Candor|Kim Scott|2017|272|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction,short
Multipliers|Liz Wiseman|2010|288|motivational|entrepreneur|Business,Leadership|non-fiction,short
Good Strategy Bad Strategy|Richard Rumelt|2011|336|mind-bending|entrepreneur|Business,Strategy|non-fiction
Playing to Win|A.G. Lafley|2013|272|mind-bending|entrepreneur|Business,Strategy|non-fiction,short
Blue Ocean Strategy|W. Chan Kim|2005|256|mind-bending|entrepreneur|Business,Strategy|bestseller,non-fiction,short
Competitive Strategy|Michael Porter|1980|396|mind-bending|entrepreneur|Business,Strategy|classic,non-fiction
Execution|Larry Bossidy|2002|288|motivational|entrepreneur|Business,Leadership|non-fiction,short
Measure What Matters|John Doerr|2018|320|motivational|entrepreneur|Business,Management|bestseller,non-fiction
The Advantage|Patrick Lencioni|2012|240|motivational|entrepreneur|Business,Leadership|non-fiction,short
The Five Dysfunctions of a Team|Patrick Lencioni|2002|229|motivational|entrepreneur|Business,Leadership|bestseller,non-fiction,short
Who Moved My Cheese|Spencer Johnson|1998|96|motivational|entrepreneur|Self-Help,Business|classic,bestseller,non-fiction,short
The Innovators Solution|Clayton Christensen|2003|320|mind-bending|entrepreneur|Business|non-fiction
Competing Against Luck|Clayton Christensen|2016|288|mind-bending|entrepreneur|Business|non-fiction,short
Jobs to Be Done|Anthony Ulwick|2016|246|motivational|entrepreneur,designer|Business|non-fiction,short
Obviously Awesome|April Dunford|2019|201|motivational|entrepreneur|Business,Marketing|non-fiction,short
Positioning|Al Ries|1981|213|mind-bending|entrepreneur|Business,Marketing|classic,non-fiction,short
Made to Stick|Chip Heath|2007|291|mind-bending|entrepreneur,designer|Business,Marketing|bestseller,non-fiction,short
Switch|Chip Heath|2010|305|motivational|entrepreneur|Self-Help|bestseller,non-fiction
Decisive|Chip Heath|2013|336|mind-bending|entrepreneur|Self-Help|non-fiction
The Power of Moments|Chip Heath|2017|304|motivational,feel-good|entrepreneur|Self-Help|non-fiction
A Brief History of Time|Stephen Hawking|1988|212|mind-bending|scientist,educator|Physics,Cosmology|classic,bestseller,non-fiction,short
The Elegant Universe|Brian Greene|1999|464|mind-bending|scientist|Physics,Cosmology|bestseller,non-fiction
The Fabric of the Cosmos|Brian Greene|2004|608|mind-bending|scientist|Physics,Cosmology|non-fiction,chunky
Cosmos|Carl Sagan|1980|396|mind-bending,feel-good|scientist,educator|Cosmology,Essays|classic,bestseller,non-fiction
Pale Blue Dot|Carl Sagan|1994|429|mind-bending,feel-good|scientist,educator|Cosmology,Essays|classic,non-fiction
The Demon-Haunted World|Carl Sagan|1995|457|mind-bending|scientist,educator|Science,Philosophy|classic,non-fiction
Sapiens|Yuval Noah Harari|2011|464|mind-bending|scientist,educator,entrepreneur|History,Anthropology|bestseller,non-fiction
Homo Deus|Yuval Noah Harari|2015|450|mind-bending|scientist,educator|History,Anthropology|bestseller,non-fiction
21 Lessons for the 21st Century|Yuval Noah Harari|2018|372|mind-bending|scientist,educator|History,Anthropology|bestseller,non-fiction
The Selfish Gene|Richard Dawkins|1976|360|mind-bending|scientist,educator|Biology,Evolution|classic,bestseller,non-fiction
The Blind Watchmaker|Richard Dawkins|1986|332|mind-bending|scientist,educator|Biology,Evolution|classic,non-fiction
The Greatest Show on Earth|Richard Dawkins|2009|470|mind-bending|scientist,educator|Biology,Evolution|non-fiction
The Ancestors Tale|Richard Dawkins|2004|688|mind-bending|scientist,educator|Biology,Evolution|non-fiction,chunky
Why Evolution Is True|Jerry A. Coyne|2009|304|mind-bending|scientist,educator|Biology,Evolution|non-fiction
On the Origin of Species|Charles Darwin|1859|502|mind-bending|scientist|Biology,Classics|classic,non-fiction
The Double Helix|James Watson|1968|256|mind-bending|scientist|Memoir,Biology|classic,memoir,non-fiction,short
What Is Life|Erwin Schrodinger|1944|184|mind-bending|scientist|Biology,Physics|classic,non-fiction,short
Genome|Matt Ridley|1999|352|mind-bending|scientist,doctor|Biology,Genetics|non-fiction
The Gene|Siddhartha Mukherjee|2016|608|mind-bending,dark-deep|scientist,doctor|Biology,Genetics|bestseller,non-fiction,chunky
The Emperor of All Maladies|Siddhartha Mukherjee|2010|592|dark-deep,mind-bending|scientist,doctor|History,Medicine|bestseller,non-fiction,award-winner,chunky
The Immortal Life of Henrietta Lacks|Rebecca Skloot|2010|381|mind-bending,dark-deep|scientist,doctor|Biography,Science|bestseller,non-fiction,award-winner
Stiff|Mary Roach|2003|304|dark-deep,feel-good|scientist,doctor|Science,Essays|non-fiction
Gulp|Mary Roach|2013|352|feel-good|scientist,doctor|Science,Essays|non-fiction
Packing for Mars|Mary Roach|2010|334|feel-good|scientist|Science,Essays|non-fiction
Bonk|Mary Roach|2008|319|feel-good|scientist,doctor|Science,Essays|non-fiction
Braiding Sweetgrass|Robin Wall Kimmerer|2013|391|feel-good,mind-bending|scientist,educator|Nature,Essays|bestseller,non-fiction
Silent Spring|Rachel Carson|1962|400|dark-deep,mind-bending|scientist,educator|Nature,Science|classic,non-fiction
The Sixth Extinction|Elizabeth Kolbert|2014|336|dark-deep,mind-bending|scientist,educator|Nature,Science|bestseller,non-fiction,award-winner
The Hidden Life of Trees|Peter Wohlleben|2015|288|feel-good,mind-bending|scientist,educator|Nature,Biology|bestseller,non-fiction,short
Entangled Life|Merlin Sheldrake|2020|352|mind-bending,feel-good|scientist|Nature,Biology|bestseller,non-fiction
The Soul of an Octopus|Sy Montgomery|2015|288|feel-good|scientist|Nature,Biology|non-fiction,short
Other Minds|Peter Godfrey-Smith|2016|272|mind-bending|scientist|Biology,Philosophy|non-fiction,short
Lab Girl|Hope Jahren|2016|304|feel-good,motivational|scientist|Memoir,Nature|memoir,non-fiction
The Man Who Mistook His Wife for a Hat|Oliver Sacks|1985|243|mind-bending|scientist,doctor|Psychology,Medicine|classic,non-fiction,short
The Brain That Changes Itself|Norman Doidge|2007|427|mind-bending|scientist,doctor|Psychology,Medicine|non-fiction
Incognito|David Eagleman|2011|290|mind-bending|scientist,educator|Psychology,Neuroscience|non-fiction,short
Phantoms in the Brain|V.S. Ramachandran|1998|328|mind-bending|scientist,doctor|Psychology,Neuroscience|non-fiction
Moonwalking with Einstein|Joshua Foer|2011|307|mind-bending|scientist,educator|Psychology,Memoir|non-fiction
How the Mind Works|Steven Pinker|1997|660|mind-bending|scientist,educator|Psychology|non-fiction,chunky
The Language Instinct|Steven Pinker|1994|483|mind-bending|scientist,educator|Psychology,Language|non-fiction
The Stuff of Thought|Steven Pinker|2007|499|mind-bending|scientist,educator|Psychology,Language|non-fiction
The Better Angels of Our Nature|Steven Pinker|2011|832|mind-bending|scientist,educator|History,Psychology|non-fiction,chunky
Enlightenment Now|Steven Pinker|2018|576|mind-bending,feel-good|scientist,educator|History,Philosophy|bestseller,non-fiction,chunky
Thinking in Systems|Donella Meadows|2008|240|mind-bending|scientist,entrepreneur|Systems,Philosophy|non-fiction,short
The Signal and the Noise|Nate Silver|2012|544|mind-bending|scientist,entrepreneur|Statistics,Data|bestseller,non-fiction,chunky
Naked Statistics|Charles Wheelan|2012|282|mind-bending|scientist,educator|Statistics,Data|non-fiction,short
How to Lie with Statistics|Darrell Huff|1954|142|mind-bending|scientist,educator|Statistics|classic,non-fiction,short
The Drunkards Walk|Leonard Mlodinow|2008|272|mind-bending|scientist|Statistics,Data|non-fiction,short
Chaos Making a New Science|James Gleick|1987|352|mind-bending|scientist|Physics,History|classic,non-fiction
Seven Brief Lessons on Physics|Carlo Rovelli|2014|96|mind-bending,feel-good|scientist|Physics,Essays|bestseller,non-fiction,short
Reality Is Not What It Seems|Carlo Rovelli|2014|280|mind-bending|scientist|Physics,Philosophy|non-fiction,short
QED The Strange Theory of Light|Richard Feynman|1985|192|mind-bending|scientist|Physics|classic,non-fiction,short
Six Easy Pieces|Richard Feynman|1994|146|mind-bending|scientist,educator|Physics|classic,non-fiction,short
Surely Youre Joking Mr Feynman|Richard Feynman|1985|384|feel-good,motivational|scientist|Memoir,Physics|classic,memoir,non-fiction
What Do You Care What Other People Think|Richard Feynman|1988|256|feel-good|scientist|Memoir,Physics|classic,memoir,non-fiction,short
The Feynman Lectures on Physics|Richard Feynman|1964|1552|mind-bending|scientist|Physics,Reference|classic,non-fiction,technical,chunky
Hyperspace|Michio Kaku|1994|359|mind-bending|scientist|Physics|non-fiction
Parallel Worlds|Michio Kaku|2005|428|mind-bending|scientist|Physics,Cosmology|non-fiction
Physics of the Impossible|Michio Kaku|2008|329|mind-bending|scientist|Physics|non-fiction
The Hot Zone|Richard Preston|1994|422|dark-deep|scientist,doctor|Science,Thriller|bestseller,non-fiction
Spillover|David Quammen|2012|592|dark-deep,mind-bending|scientist,doctor|Science,Biology|non-fiction,chunky
A Man on the Moon|Andrew Chaikin|1994|670|motivational|scientist|History,Space|classic,non-fiction,chunky
Rocket Men|Robert Kurson|2018|384|motivational|scientist,entrepreneur|History,Space|non-fiction
The Right Stuff|Tom Wolfe|1979|436|motivational|scientist|History,Space|classic,bestseller,non-fiction,award-winner
Astrophysics for People in a Hurry|Neil deGrasse Tyson|2017|224|mind-bending,feel-good|scientist,educator|Physics,Cosmology|bestseller,non-fiction,short
Death by Black Hole|Neil deGrasse Tyson|2007|384|mind-bending|scientist,educator|Physics,Cosmology|non-fiction
The Order of Time|Carlo Rovelli|2017|240|mind-bending|scientist|Physics,Philosophy|bestseller,non-fiction,short
Helgoland|Carlo Rovelli|2020|240|mind-bending|scientist|Physics,Philosophy|non-fiction,short
Something Deeply Hidden|Sean Carroll|2019|368|mind-bending|scientist|Physics,Philosophy|non-fiction
The Big Picture|Sean Carroll|2016|480|mind-bending|scientist|Physics,Philosophy|non-fiction
Endurance|Scott Kelly|2017|400|motivational|scientist|Memoir,Space|memoir,bestseller,non-fiction
Being Mortal|Atul Gawande|2014|282|dark-deep,feel-good|doctor,educator|Medicine,Essays|bestseller,non-fiction
When Breath Becomes Air|Paul Kalanithi|2016|228|dark-deep,feel-good|doctor|Memoir,Medicine|memoir,bestseller,non-fiction,short
The Checklist Manifesto|Atul Gawande|2009|224|motivational|doctor,entrepreneur|Medicine,Essays|bestseller,non-fiction,short
Complications|Atul Gawande|2002|288|mind-bending|doctor|Medicine,Essays|non-fiction,short
Better|Atul Gawande|2007|273|mind-bending|doctor|Medicine,Essays|non-fiction,short
The House of God|Samuel Shem|1978|381|dark-deep|doctor|Medicine,Fiction|classic,fiction
Cutting for Stone|Abraham Verghese|2009|667|dark-deep|doctor|Fiction,Medicine|bestseller,fiction,chunky
Do No Harm|Henry Marsh|2014|288|dark-deep|doctor|Memoir,Medicine|memoir,non-fiction,short
Admissions|Henry Marsh|2017|288|dark-deep|doctor|Memoir,Medicine|memoir,non-fiction,short
The Spirit Catches You and You Fall Down|Anne Fadiman|1997|352|dark-deep,mind-bending|doctor,educator|Medicine,Anthropology|classic,non-fiction
Mountains Beyond Mountains|Tracy Kidder|2003|336|motivational|doctor|Biography,Medicine|bestseller,non-fiction
Bad Blood|John Carreyrou|2018|352|dark-deep|doctor,entrepreneur|Business,Medicine|bestseller,non-fiction
Five Days at Memorial|Sheri Fink|2013|558|dark-deep|doctor|History,Medicine|award-winner,non-fiction,chunky
The Great Influenza|John Barry|2004|560|dark-deep,mind-bending|doctor,scientist|History,Medicine|non-fiction,chunky
Plagues and Peoples|William McNeill|1976|365|mind-bending|doctor,scientist|History,Medicine|classic,non-fiction
The Coming Plague|Laurie Garrett|1994|750|dark-deep|doctor,scientist|History,Medicine|non-fiction,chunky
An Elegant Defense|Matt Richtel|2019|434|mind-bending|doctor,scientist|Medicine,Biology|non-fiction
How We Die|Sherwin Nuland|1994|304|dark-deep,mind-bending|doctor|Medicine,Essays|non-fiction
How We Live|Sherwin Nuland|1997|432|mind-bending|doctor|Medicine,Essays|non-fiction
The Body A Guide for Occupants|Bill Bryson|2019|464|feel-good,mind-bending|doctor,scientist|Science,Medicine|bestseller,non-fiction
Mans Search for Meaning|Viktor Frankl|1946|200|dark-deep,motivational|doctor,educator|Memoir,Psychology|classic,bestseller,memoir,non-fiction,short
The Body Keeps the Score|Bessel van der Kolk|2014|464|dark-deep,mind-bending|doctor|Psychology,Medicine|bestseller,non-fiction
The Denial of Death|Ernest Becker|1973|336|dark-deep,mind-bending|doctor,educator|Philosophy,Psychology|classic,non-fiction,award-winner
Why Zebras Dont Get Ulcers|Robert Sapolsky|1994|560|mind-bending|doctor,scientist|Biology,Medicine|non-fiction,chunky
Behave|Robert Sapolsky|2017|790|mind-bending|doctor,scientist|Biology,Psychology|bestseller,non-fiction,chunky
The Power of Habit|Charles Duhigg|2012|371|motivational|doctor,entrepreneur|Self-Help,Psychology|bestseller,non-fiction
In the Realm of Hungry Ghosts|Gabor Mate|2008|480|dark-deep|doctor|Medicine,Psychology|non-fiction
When the Body Says No|Gabor Mate|2003|306|dark-deep|doctor|Medicine,Psychology|non-fiction
Gut The Inside Story|Giulia Enders|2014|288|feel-good|doctor,scientist|Medicine,Biology|bestseller,non-fiction,short
Salt Sugar Fat|Michael Moss|2013|446|dark-deep|doctor|Nutrition,Business|bestseller,non-fiction
In Defense of Food|Michael Pollan|2008|244|motivational|doctor|Nutrition,Essays|bestseller,non-fiction,short
Food Rules|Michael Pollan|2009|140|motivational|doctor|Nutrition|non-fiction,short
How Not to Die|Michael Greger|2015|576|motivational|doctor|Nutrition,Medicine|bestseller,non-fiction,chunky
The Obesity Code|Jason Fung|2016|304|motivational|doctor|Nutrition,Medicine|bestseller,non-fiction
Why We Sleep|Matthew Walker|2017|368|mind-bending|doctor,scientist|Medicine,Biology|bestseller,non-fiction
The Circadian Code|Satchin Panda|2018|320|motivational|doctor,scientist|Medicine,Biology|non-fiction
Lifespan|David Sinclair|2019|432|motivational,mind-bending|doctor,scientist|Medicine,Biology|bestseller,non-fiction
Breath|James Nestor|2020|304|mind-bending|doctor|Medicine,Science|bestseller,non-fiction
Move|Caroline Williams|2021|288|motivational|doctor|Medicine,Science|non-fiction,short
The Whole-Brain Child|Daniel Siegel|2011|192|motivational|doctor,educator|Psychology,Parenting|bestseller,non-fiction,short
The Developing Mind|Daniel Siegel|2012|506|mind-bending|doctor,educator|Psychology|non-fiction,chunky
Grain Brain|David Perlmutter|2013|336|motivational|doctor|Nutrition,Medicine|bestseller,non-fiction
The Mind-Gut Connection|Emeran Mayer|2016|320|mind-bending|doctor,scientist|Medicine,Biology|non-fiction
This Is Going to Hurt|Adam Kay|2017|304|dark-deep,feel-good|doctor|Memoir,Medicine|bestseller,memoir,non-fiction
Black Box Thinking|Matthew Syed|2015|336|motivational|doctor,entrepreneur,educator|Self-Help,Business|non-fiction
The Laws of Medicine|Siddhartha Mukherjee|2015|96|mind-bending|doctor|Medicine,Essays|non-fiction,short
Just Mercy|Bryan Stevenson|2014|368|dark-deep,motivational|lawyer,educator|Memoir,Justice|bestseller,memoir,non-fiction,award-winner
A Civil Action|Jonathan Harr|1995|500|dark-deep|lawyer|Non-Fiction,Law|bestseller,non-fiction
Presumed Innocent|Scott Turow|1987|431|dark-deep|lawyer|Fiction,Thriller|bestseller,fiction
The Firm|John Grisham|1991|432|dark-deep|lawyer|Fiction,Thriller|bestseller,fiction
Gideons Trumpet|Anthony Lewis|1964|262|motivational|lawyer,educator|History,Law|classic,non-fiction,short
The Nine|Jeffrey Toobin|2007|369|mind-bending|lawyer|History,Politics|non-fiction
The Brethren|Bob Woodward|1979|480|mind-bending|lawyer|History,Politics|classic,non-fiction
The Common Law|Oliver Wendell Holmes|1881|422|mind-bending|lawyer|Law,Philosophy|classic,non-fiction
Legal Writing in Plain English|Bryan Garner|2013|235|motivational|lawyer,developer|Writing,Law|non-fiction,short
The Winning Brief|Bryan Garner|2014|784|motivational|lawyer|Writing,Law|non-fiction,chunky
Making Your Case|Antonin Scalia|2008|245|motivational|lawyer|Writing,Law|non-fiction,short
Reading Law|Antonin Scalia|2012|567|mind-bending|lawyer|Law,Philosophy|non-fiction,chunky
The Living Constitution|David Strauss|2010|208|mind-bending|lawyer,educator|Law,Philosophy|non-fiction,short
The Concept of Law|H.L.A. Hart|1961|352|mind-bending|lawyer,educator|Philosophy,Law|classic,non-fiction
Laws Empire|Ronald Dworkin|1986|470|mind-bending|lawyer,educator|Philosophy,Law|classic,non-fiction
Taking Rights Seriously|Ronald Dworkin|1977|383|mind-bending|lawyer,educator|Philosophy,Law|classic,non-fiction
A Theory of Justice|John Rawls|1971|538|mind-bending|lawyer,educator|Philosophy|classic,non-fiction,chunky
The Rule of Law|Tom Bingham|2010|213|mind-bending|lawyer|Law,Philosophy|non-fiction,short
Nudge|Richard Thaler|2008|312|mind-bending|lawyer,entrepreneur,scientist|Psychology,Economics|bestseller,non-fiction
Noise|Daniel Kahneman|2021|464|mind-bending|lawyer,entrepreneur,scientist|Psychology,Economics|bestseller,non-fiction
My Beloved World|Sonia Sotomayor|2013|315|motivational,feel-good|lawyer|Memoir|bestseller,memoir,non-fiction
Notorious RBG|Irin Carmon|2015|240|motivational,feel-good|lawyer|Biography|bestseller,non-fiction,short
Becoming|Michelle Obama|2018|448|motivational,feel-good|lawyer,educator|Memoir|bestseller,memoir,non-fiction
The Chief|Joan Biskupic|2019|432|mind-bending|lawyer|Biography|non-fiction
Scalia A Court of One|Bruce Allen Murphy|2014|656|mind-bending|lawyer|Biography|non-fiction,chunky
American Law in the 20th Century|Lawrence Friedman|2002|624|mind-bending|lawyer,educator|History,Law|non-fiction,chunky
The Path of the Law|Oliver Wendell Holmes|1897|63|mind-bending|lawyer|Essays,Law|classic,non-fiction,short
The Case Against the Supreme Court|Erwin Chemerinsky|2014|400|dark-deep|lawyer,educator|Law,Politics|non-fiction
We the Corporations|Adam Winkler|2018|496|mind-bending|lawyer|History,Law|non-fiction
Democracy and Distrust|John Hart Ely|1980|283|mind-bending|lawyer,educator|Law,Philosophy|classic,non-fiction,short
One Case at a Time|Cass Sunstein|1999|298|mind-bending|lawyer,educator|Law,Philosophy|non-fiction,short
Making Democracy Work|Stephen Breyer|2010|288|mind-bending|lawyer|Law,Politics|non-fiction,short
The Bluebook|Harvard Law Review|2020|620|mind-bending|lawyer|Reference,Law|non-fiction,technical,chunky
The New Jim Crow|Michelle Alexander|2010|352|dark-deep|lawyer,educator|History,Justice|bestseller,non-fiction
Ghettoside|Jill Leovy|2015|384|dark-deep|lawyer|Non-Fiction,Justice|non-fiction
Locked In|John Pfaff|2017|288|mind-bending|lawyer,educator|Non-Fiction,Justice|non-fiction,short
Copyrights Highway|Paul Goldstein|2003|280|mind-bending|lawyer|Law,History|non-fiction,short
The Death of Common Sense|Philip K. Howard|1994|224|mind-bending|lawyer|Law,Essays|non-fiction,short
Mindset|Carol Dweck|2006|320|motivational|educator,entrepreneur|Psychology,Self-Help|bestseller,non-fiction
Grit|Angela Duckworth|2016|352|motivational|educator,entrepreneur,scientist|Psychology,Self-Help|bestseller,non-fiction
Make It Stick|Peter C. Brown|2014|336|mind-bending|educator,scientist|Psychology,Learning|non-fiction
How We Learn|Benedict Carey|2014|272|mind-bending|educator,scientist|Psychology,Learning|non-fiction,short
Why Dont Students Like School|Daniel Willingham|2009|228|mind-bending|educator|Psychology,Learning|non-fiction,short
Teach Like Your Hairs on Fire|Rafe Esquith|2007|256|motivational,feel-good|educator|Education|non-fiction,short
Savage Inequalities|Jonathan Kozol|1991|272|dark-deep|educator|Education,Politics|classic,non-fiction,short
The Element|Ken Robinson|2009|320|motivational,feel-good|educator|Education,Self-Help|bestseller,non-fiction
A Mind for Numbers|Barbara Oakley|2014|336|motivational,mind-bending|educator,scientist,developer|Psychology,Learning|bestseller,non-fiction
How Children Succeed|Paul Tough|2012|231|mind-bending|educator,doctor|Education,Psychology|bestseller,non-fiction,short
The Courage to Teach|Parker Palmer|1997|199|motivational|educator|Education,Essays|non-fiction,short
Teaching to Transgress|bell hooks|1994|216|motivational,mind-bending|educator|Education,Essays|classic,non-fiction,short
Pedagogy of the Oppressed|Paulo Freire|1968|183|mind-bending|educator|Education,Philosophy|classic,non-fiction,short
Experience and Education|John Dewey|1938|91|mind-bending|educator|Education,Philosophy|classic,non-fiction,short
Democracy and Education|John Dewey|1916|434|mind-bending|educator|Education,Philosophy|classic,non-fiction
Emile|Jean-Jacques Rousseau|1762|480|mind-bending|educator|Education,Philosophy|classic,non-fiction
How to Raise a Reader|Pamela Paul|2019|208|feel-good|educator|Education,Parenting|non-fiction,short
Visible Learning|John Hattie|2008|392|mind-bending|educator|Education,Research|non-fiction
Understanding by Design|Grant Wiggins|2005|384|mind-bending|educator|Education,Pedagogy|non-fiction
The Differentiated Classroom|Carol Ann Tomlinson|2014|197|motivational|educator|Education,Pedagogy|non-fiction,short
Teach Like a Champion|Doug Lemov|2010|496|motivational|educator|Education,Pedagogy|bestseller,non-fiction
Building a Better Teacher|Elizabeth Green|2014|371|mind-bending|educator|Education,History|non-fiction
The Teacher Wars|Dana Goldstein|2014|368|mind-bending|educator|History,Education|non-fiction
The Homework Myth|Alfie Kohn|2006|252|mind-bending|educator|Education,Essays|non-fiction,short
Punished by Rewards|Alfie Kohn|1993|432|mind-bending|educator|Education,Psychology|non-fiction
Free to Learn|Peter Gray|2013|288|mind-bending|educator|Education,Psychology|non-fiction,short
How Learning Works|Susan Ambrose|2010|336|mind-bending|educator|Education,Research|non-fiction
Small Teaching|James Lang|2016|272|motivational|educator|Education,Pedagogy|non-fiction,short
What the Best College Teachers Do|Ken Bain|2004|207|motivational|educator|Education,Pedagogy|non-fiction,short
The Knowledge Gap|Natalie Wexler|2019|352|mind-bending|educator|Education,Research|non-fiction
The Art of Teaching|Gilbert Highet|1950|291|motivational|educator|Education,Essays|classic,non-fiction,short
Readicide|Kelly Gallagher|2009|168|dark-deep|educator|Education,Essays|non-fiction,short
The Innovators Mindset|George Couros|2015|264|motivational|educator,entrepreneur|Education,Leadership|non-fiction,short
Project Hail Mary|Andy Weir|2021|476|feel-good,mind-bending|scientist,developer|Science Fiction|bestseller,fiction
The Martian|Andy Weir|2011|369|feel-good,mind-bending|scientist,developer|Science Fiction|bestseller,fiction
Recursion|Blake Crouch|2019|336|dark-deep,mind-bending|scientist,developer|Science Fiction|fiction
Dark Matter|Blake Crouch|2016|342|dark-deep,mind-bending|scientist|Science Fiction|bestseller,fiction
Cloud Atlas|David Mitchell|2004|509|mind-bending|educator|Fiction|award-winner,fiction
The Three-Body Problem|Cixin Liu|2008|390|mind-bending,dark-deep|scientist,developer|Science Fiction|bestseller,fiction,award-winner
The Left Hand of Darkness|Ursula K. Le Guin|1969|304|mind-bending|educator,scientist|Science Fiction|classic,award-winner,fiction,short
Dune|Frank Herbert|1965|688|mind-bending,dark-deep|scientist|Science Fiction|classic,bestseller,award-winner,fiction,chunky
Foundation|Isaac Asimov|1951|244|mind-bending|scientist|Science Fiction|classic,fiction,short
1984|George Orwell|1949|328|dark-deep,mind-bending|educator|Dystopia,Fiction|classic,fiction
Brave New World|Aldous Huxley|1932|311|dark-deep,mind-bending|educator|Dystopia,Fiction|classic,fiction
Fahrenheit 451|Ray Bradbury|1953|249|dark-deep,mind-bending|educator|Dystopia,Fiction|classic,fiction,short
The Handmaids Tale|Margaret Atwood|1985|311|dark-deep|educator|Dystopia,Fiction|classic,bestseller,fiction
The Road|Cormac McCarthy|2006|287|dark-deep|educator|Fiction|award-winner,fiction,short
Beloved|Toni Morrison|1987|324|dark-deep|educator,lawyer|Fiction|classic,award-winner,fiction
Song of Solomon|Toni Morrison|1977|337|dark-deep|educator|Fiction|classic,award-winner,fiction
The Color Purple|Alice Walker|1982|295|dark-deep|educator|Fiction|classic,award-winner,fiction,short
Their Eyes Were Watching God|Zora Neale Hurston|1937|193|dark-deep|educator|Fiction|classic,fiction,short
Invisible Man|Ralph Ellison|1952|581|dark-deep|educator|Fiction|classic,award-winner,fiction,chunky
Americanah|Chimamanda Ngozi Adichie|2013|477|dark-deep,feel-good|educator|Fiction|bestseller,fiction
Half of a Yellow Sun|Chimamanda Ngozi Adichie|2006|543|dark-deep|educator|Fiction|bestseller,fiction,chunky
Pachinko|Min Jin Lee|2017|485|dark-deep|educator|Fiction|bestseller,fiction
Little Fires Everywhere|Celeste Ng|2017|338|dark-deep|educator|Fiction|bestseller,fiction
Normal People|Sally Rooney|2018|273|romantic,dark-deep|educator|Romance,Fiction|bestseller,fiction,short
Conversations with Friends|Sally Rooney|2017|321|romantic|educator|Romance,Fiction|fiction
Where the Crawdads Sing|Delia Owens|2018|384|dark-deep|educator|Fiction,Mystery|bestseller,fiction
A Gentleman in Moscow|Amor Towles|2016|462|feel-good|educator|Fiction|bestseller,fiction
The Overstory|Richard Powers|2018|502|mind-bending|educator,scientist|Fiction|award-winner,fiction
Circe|Madeline Miller|2018|393|feel-good,mind-bending|educator|Fantasy,Fiction|bestseller,fiction
The Song of Achilles|Madeline Miller|2011|378|romantic,dark-deep|educator|Fantasy,Fiction|bestseller,fiction
The Silent Patient|Alex Michaelides|2019|336|dark-deep|educator|Mystery,Thriller|bestseller,fiction
The Midnight Library|Matt Haig|2020|288|feel-good,mind-bending|educator|Fiction|bestseller,fiction,short
The Seven Husbands of Evelyn Hugo|Taylor Jenkins Reid|2017|389|romantic|educator|Fiction,Romance|bestseller,fiction
Daisy Jones and the Six|Taylor Jenkins Reid|2019|368|feel-good|educator|Fiction|bestseller,fiction
Malibu Rising|Taylor Jenkins Reid|2021|368|feel-good|educator|Fiction|bestseller,fiction
The Secret History|Donna Tartt|1992|559|dark-deep,mind-bending|educator|Fiction,Mystery|classic,fiction,chunky
The Goldfinch|Donna Tartt|2013|771|dark-deep|educator|Fiction|award-winner,fiction,chunky
Bel Canto|Ann Patchett|2001|318|romantic|educator|Fiction|award-winner,fiction
State of Wonder|Ann Patchett|2011|353|mind-bending|educator,scientist|Fiction|fiction
Commonwealth|Ann Patchett|2016|322|feel-good|educator|Fiction|bestseller,fiction
The Kite Runner|Khaled Hosseini|2003|371|dark-deep|educator|Fiction|classic,bestseller,fiction
A Thousand Splendid Suns|Khaled Hosseini|2007|367|dark-deep|educator|Fiction|bestseller,fiction
The Book Thief|Markus Zusak|2005|552|dark-deep,feel-good|educator|Fiction,History|classic,bestseller,fiction
All the Light We Cannot See|Anthony Doerr|2014|531|dark-deep|educator|Fiction,History|bestseller,award-winner,fiction,chunky
Beartown|Fredrik Backman|2016|432|dark-deep|educator|Fiction|bestseller,fiction
A Man Called Ove|Fredrik Backman|2012|337|feel-good|educator|Fiction|bestseller,fiction
The Girl with the Dragon Tattoo|Stieg Larsson|2005|465|dark-deep|educator|Mystery,Thriller|bestseller,fiction
The Night Circus|Erin Morgenstern|2011|507|mind-bending,romantic|educator|Fantasy|bestseller,fiction
The Starless Sea|Erin Morgenstern|2019|498|mind-bending|educator|Fantasy|fiction
Piranesi|Susanna Clarke|2020|245|mind-bending|educator|Fantasy|bestseller,fiction,short
Mexican Gothic|Silvia Moreno-Garcia|2020|301|dark-deep|educator|Horror,Fantasy|bestseller,fiction
Klara and the Sun|Kazuo Ishiguro|2021|303|dark-deep,mind-bending|educator|Science Fiction|bestseller,fiction
Never Let Me Go|Kazuo Ishiguro|2005|288|dark-deep,mind-bending|educator|Science Fiction|classic,fiction,short
The Remains of the Day|Kazuo Ishiguro|1989|258|dark-deep|educator|Fiction|classic,award-winner,fiction,short
A Little Life|Hanya Yanagihara|2015|720|dark-deep|educator|Fiction|fiction,chunky
The Help|Kathryn Stockett|2009|522|dark-deep,feel-good|educator|Fiction|bestseller,fiction,chunky
The Vanishing Half|Brit Bennett|2020|343|dark-deep|educator|Fiction|bestseller,fiction
Homegoing|Yaa Gyasi|2016|305|dark-deep|educator|Fiction|bestseller,fiction
Transcendent Kingdom|Yaa Gyasi|2020|264|dark-deep,mind-bending|educator,scientist|Fiction|bestseller,fiction,short
One Hundred Years of Solitude|Gabriel Garcia Marquez|1967|417|mind-bending|educator|Fiction|classic,award-winner,fiction
Love in the Time of Cholera|Gabriel Garcia Marquez|1985|348|romantic|educator|Romance,Fiction|classic,fiction
The Alchemist|Paulo Coelho|1988|163|feel-good,motivational|educator|Fiction,Fable|classic,bestseller,fiction,short
The Shadow of the Wind|Carlos Ruiz Zafon|2001|487|dark-deep,mind-bending|educator|Fiction,Mystery|bestseller,fiction
Anna Karenina|Leo Tolstoy|1877|964|dark-deep,romantic|educator|Fiction,Romance|classic,fiction,chunky
War and Peace|Leo Tolstoy|1869|1225|dark-deep|educator|Fiction,History|classic,fiction,chunky
Crime and Punishment|Fyodor Dostoevsky|1866|671|dark-deep,mind-bending|educator|Fiction,Philosophy|classic,fiction,chunky
The Brothers Karamazov|Fyodor Dostoevsky|1880|796|dark-deep,mind-bending|educator|Fiction,Philosophy|classic,fiction,chunky
Notes from Underground|Fyodor Dostoevsky|1864|136|dark-deep|educator|Fiction,Philosophy|classic,fiction,short
The Master and Margarita|Mikhail Bulgakov|1967|384|mind-bending|educator|Fiction|classic,fiction
A Farewell to Arms|Ernest Hemingway|1929|332|dark-deep,romantic|educator|Fiction|classic,fiction
For Whom the Bell Tolls|Ernest Hemingway|1940|471|dark-deep|educator|Fiction|classic,fiction
The Sun Also Rises|Ernest Hemingway|1926|251|dark-deep|educator|Fiction|classic,fiction,short
The Old Man and the Sea|Ernest Hemingway|1952|127|motivational|educator|Fiction|classic,award-winner,fiction,short
The Great Gatsby|F. Scott Fitzgerald|1925|180|dark-deep|educator|Fiction|classic,fiction,short
Tender is the Night|F. Scott Fitzgerald|1934|317|dark-deep|educator|Fiction|classic,fiction
Of Mice and Men|John Steinbeck|1937|107|dark-deep|educator|Fiction|classic,fiction,short
The Grapes of Wrath|John Steinbeck|1939|464|dark-deep|educator|Fiction|classic,award-winner,fiction
East of Eden|John Steinbeck|1952|602|dark-deep|educator|Fiction|classic,fiction,chunky
To Kill a Mockingbird|Harper Lee|1960|281|motivational|educator,lawyer|Fiction|classic,bestseller,award-winner,fiction
Go Set a Watchman|Harper Lee|2015|278|dark-deep|educator,lawyer|Fiction|fiction,short
The Fire Next Time|James Baldwin|1963|106|dark-deep|educator,lawyer|Essays|classic,non-fiction,short
Between the World and Me|Ta-Nehisi Coates|2015|152|dark-deep|educator,lawyer|Essays|bestseller,non-fiction,short
Caste|Isabel Wilkerson|2020|496|dark-deep,mind-bending|educator,lawyer|History|bestseller,non-fiction
The Warmth of Other Suns|Isabel Wilkerson|2010|622|dark-deep|educator|History|bestseller,non-fiction,award-winner,chunky
Just Kids|Patti Smith|2010|304|feel-good,motivational|designer|Memoir|memoir,bestseller,non-fiction
The Year of Magical Thinking|Joan Didion|2005|227|dark-deep|educator|Memoir|memoir,award-winner,non-fiction,short
Wild|Cheryl Strayed|2012|336|motivational|educator|Memoir|bestseller,memoir,non-fiction
Tiny Beautiful Things|Cheryl Strayed|2012|353|feel-good|educator|Essays|non-fiction
Bird by Bird|Anne Lamott|1994|237|motivational,feel-good|designer,educator|Writing,Essays|classic,non-fiction,short
On Writing|Stephen King|2000|288|motivational|educator|Writing,Memoir|bestseller,memoir,non-fiction,short
The War of Art|Steven Pressfield|2002|190|motivational|designer,entrepreneur,educator|Self-Help|non-fiction,short
The Writing Life|Annie Dillard|1989|111|motivational|educator|Writing,Essays|classic,non-fiction,short
Pilgrim at Tinker Creek|Annie Dillard|1974|290|feel-good,mind-bending|educator,scientist|Essays,Nature|classic,award-winner,non-fiction,short
Educated|Tara Westover|2018|334|dark-deep,motivational|educator|Memoir|bestseller,memoir,non-fiction,award-winner
Hillbilly Elegy|J.D. Vance|2016|264|dark-deep|educator|Memoir|bestseller,memoir,non-fiction,short
I Am Malala|Malala Yousafzai|2013|327|motivational|educator|Memoir|bestseller,memoir,non-fiction
Long Walk to Freedom|Nelson Mandela|1994|656|motivational|lawyer|Memoir|classic,memoir,non-fiction,chunky
`;

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// Deterministic synthetic ISBN-13 from the slug. Covers *may* 404 on
// Open Library — BookCard already falls back to a gradient placeholder.
function isbnFor(slug) {
  let h = 5381;
  for (const c of slug) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  const body = String(h).padStart(10, '0').slice(0, 10);
  return '978' + body;
}

const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

// Well-known ISBNs for the handful of titles where we want a real cover to
// show up reliably. Everything else falls back to the synthetic ISBN; the
// BookCard component shows a nice gradient placeholder when the image 404s.
const REAL_ISBN = {
  'atomic-habits-clear': '9780735211292',
  'the-pragmatic-programmer-thomas': '9780135957059',
  'the-design-of-everyday-things-norman': '9780465050659',
  'zero-to-one-thiel': '9780804139298',
  'the-lean-startup-ries': '9780307887894',
  'sapiens-harari': '9780062316097',
  'thinking-fast-and-slow-kahneman': '9780374533557',
  'man-s-search-for-meaning-frankl': '9780807014271',
  'the-martian-weir': '9780553418026',
  'dune-herbert': '9780441172719',
  '1984-orwell': '9780451524935',
  'the-great-gatsby-fitzgerald': '9780743273565',
  'to-kill-a-mockingbird-lee': '9780061120084',
  'being-mortal-gawande': '9780805095159',
  'when-breath-becomes-air-kalanithi': '9780812988406',
  'educated-westover': '9780399590504',
};

const lines = RAW.trim().split('\n').filter(Boolean);
const seen = new Set();
const books = [];

for (const line of lines) {
  const parts = line.split('|').map((s) => s.trim());
  if (parts.length !== 8) {
    console.warn(`skipping malformed line: ${line.slice(0, 80)}`);
    continue;
  }
  const [title, author, yearStr, pagesStr, moodsStr, profsStr, genresStr, tagsStr] = parts;
  const authorLast = (author.split(/\s+/).pop() ?? '').toLowerCase();
  const slug = slugify(`${title}-${authorLast}`);
  if (seen.has(slug)) continue; // dedupe
  seen.add(slug);

  const isbn = REAL_ISBN[slug] ?? isbnFor(slug);
  const genres = genresStr.split(',').map((s) => s.trim()).filter(Boolean);
  const moods = moodsStr.split(',').map((s) => s.trim()).filter(Boolean);
  const professions = profsStr.split(',').map((s) => s.trim()).filter(Boolean);
  const tags = tagsStr.split(',').map((s) => s.trim()).filter(Boolean);
  const year = Number(yearStr);
  const pages = Number(pagesStr);

  // Template description — terse, factual, safe to ship without risk of
  // misrepresenting the actual book. The detail modal + card still feel full.
  const description = `${genres[0] ?? 'Book'} by ${author}. ${year} · ${pages} pages.`;

  books.push({
    id: slug,
    title,
    author,
    isbn,
    cover: cover(isbn),
    description,
    pages,
    year,
    genres,
    moods,
    professions,
    tags,
  });
}

// ----- write src/data/books.ts --------------------------------------------
// Each book is emitted as a literal with an explicit string cover URL. We
// keep the output as a plain JSON.stringify so it's easy to eyeball and diff.
const tsBody = `import type { Book } from '../types';

/**
 * Seeded book catalogue — ${books.length} titles. Auto-generated by
 * scripts/generate-books.mjs. Re-run that script after editing the RAW
 * list there; don't hand-edit this file.
 *
 * Covers are served by Open Library. BookCard falls back to a coloured
 * gradient placeholder on image error, so unknown ISBNs degrade cleanly.
 */
export const BOOKS: Book[] = ${JSON.stringify(books, null, 2)};

export const BOOK_BY_ID: Record<string, Book> = BOOKS.reduce(
  (acc, b) => ({ ...acc, [b.id]: b }),
  {} as Record<string, Book>,
);
`;

fs.writeFileSync(path.join(ROOT, 'src/data/books.ts'), tsBody);

// ----- write supabase/books_seed.sql --------------------------------------
const esc = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const arr = (xs) => `ARRAY[${xs.map(esc).join(',')}]::text[]`;

const sqlHeader = `-- Auto-generated by scripts/generate-books.mjs
-- Seeds the books table with ${books.length} curated titles.
-- Safe to re-run: uses "on conflict (id) do nothing".

insert into books (id, title, author, isbn, cover, description, pages, year, genres, moods, professions, tags)
values
`;

const sqlRows = books
  .map(
    (b, i) =>
      `  (${esc(b.id)}, ${esc(b.title)}, ${esc(b.author)}, ${esc(b.isbn)}, ${esc(b.cover)}, ${esc(
        b.description,
      )}, ${b.pages}, ${b.year}, ${arr(b.genres)}, ${arr(b.moods)}, ${arr(b.professions)}, ${arr(
        b.tags,
      )})${i === books.length - 1 ? '' : ','}`,
  )
  .join('\n');

const sqlFooter = `
on conflict (id) do nothing;
`;

fs.writeFileSync(path.join(ROOT, 'supabase/books_seed.sql'), sqlHeader + sqlRows + sqlFooter);

console.log(`Wrote ${books.length} books to src/data/books.ts`);
console.log(`Wrote ${books.length} books to supabase/books_seed.sql`);
