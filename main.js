// store the data link as a variable 
const csvURL = "https://gist.githubusercontent.com/jeremiak/c564a2227fcc82326b37d0166fd777c7/raw/4da27d4cbbf48abe85bf52936eabfe20e04c4fa7/life_expectancy_gdp_pop_year.csv"

//read in the data
// js is asynchronous. it doesn't care what order it comes in.  we use .then to get over that.
d3.csv(csvURL).then(function(data){
  
  //set up a width and a height
  const width = 800
  const height = 400

  //let's set up the color encoding for the continent circles
  const regionColors = { 
    "africa": "darkseagreen",
    "asia": "indianred",
    "americas": "gold",
    "europe": "lightblue"
  }

  //let's make our x-scale (income)
  //but first, we need to know the min/max income for our domain
  const incomeMin = d3.min(data, d => +d.income_per_person) //the "+" sign converts string to numbers
  const incomeMax = d3.max(data, d => +d.income_per_person)
  const xScale = d3.scaleLog()
                   .domain([10, incomeMax])
                   .range([0, width])

  //let's make our y-scale now (life expectancy)
  //first, let's get the min/max of life expectancy. we'll use the extent function this time.
  const lifeExpectancyExtent = d3.extent(data, d => +d.life_expectancy)
  const yScale = d3.scaleLinear()
                   .domain(lifeExpectancyExtent)
                   .range([height, 0])
        
  //let's make our population scale, too
  //we'll use a square-root scale because the area of a circle is pi*r^2
  const populationExtent = d3.extent(data, d => +d.population)
  const rScale = d3.scaleSqrt()
                   .domain(populationExtent)
                   .range([2,40])
  
  //now let's set the extent for our years
  const yearExtent = d3.extent(data, d => +d.year)
  //we'll find the earliest year, too, and name it "year"
  //and we'll set it up as a variable ("let") rather than a constant so it can change when we make our loop
  let year = yearExtent[0] //Year extent is an array strucutered like [min, max]
  //.filter goes through data and see if it meets the conditions we have set out
  //we want to go through our dataset and make an array for every year
  //let's set up a function so that when we can get all the arrays when we do year + 1 later on
  //we'll start with an array for the earliest year
  const earliestYearData = data.filter(function(d){
    if (+d.year === year) {return true}
    else {return false}
  })
  
  console.log(earliestYearData)

  //let's append an svg to our html so we can actually chart something
  //we're adding 'height' and 'width' attributes to the HTML using the height and width varaibles we've defined
  const svg = d3.select('div#chart').append('svg').attr('height', height).attr('width', width)

  //let's make our axes
  //and let's convert the scientific notation
  //axisBottom just means the notation comes in the bottom, not that the axis is in the bottom
  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('.2s'))
  const yAxis = d3.axisLeft().scale(yScale)
  svg.append('g') //'g' is like the 'div' tag for js. it group things.
     .attr('class', 'axis-x')
     .attr('transform', 'translate(0 '+(height-30)+')')
     .call(xAxis)
  svg.append('g')
     .attr('class', 'axis-y')
     .attr('transform', 'translate(20 0)')
     .call(yAxis)

  //let's create our circles now
  //let's select all our circles and bind them with our data
  svg.selectAll('circle').data(earliestYearData)
     .enter() //this is how we bind the data 
     .append('circle')
     .attr('cy', d => yScale(+d.life_expectancy)) //'cx' and 'cy' is how you create circles on svg, remember?
     .attr('cx', d => xScale(+d.income_per_person))
     .attr('r', d => rScale(+d.population))
     .attr('fill', d => regionColors[d.region])
     .attr('opacity', .8)
     //let's highlight China by giving it an outline
  //    .attr('stroke', function (d) { 
  //   const country = d.country
  //   if (country === 'China') {
  //     return 'hotpink'
  //   }
  // })

  //now, let's animate this puppy
  //but first, we need the year to show up so we know what year we're on when it's animated
  svg.append('text')
     .attr('id', 'year')
     .attr('dy', height * .8)
     .attr('dx', 500)
     .attr('font-size', '100px')
     .attr('opacity', .3)
     .text(year)

  //now it's set up, let's hide all of it before the scrolly starts
  svg.select('.axis-x').attr('opacity', 0)
  svg.select('.axis-y').attr('opacity', 0)
  svg.select('#year').attr('opacity', 0)
  svg.selectAll('circle').attr('opacity', 0) //we use selectAll here because we want all the circles
  //if we use select, only one will show up

  //now, let's set up scrollama here
  const scroller = scrollama()
  //let's set up the functions for showing and hiding, so that we can make sure it works backwards
  function hide(selector){
      svg.selectAll(selector).transition(200).attr('opacity', 0) //transition is the time it takes for the step to fade in
  }
  function show(selector, opacity = 1){
      svg.selectAll(selector).transition(200).attr('opacity', opacity)
  }
  let interval = null
  //remember, scrolly is based on steps that we can trigger. let's set that up.
  scroller.setup({
      step: '.step', //identify the HTML class you want to trigger
      offset: .5 //this tells the script to trigger the step once we're 0.5 (halfway) through the screen (it's the percent of the page compelete)
      //debug: true //this shows visual debugging tools. very helpful for the processing but it's not for publishing.
  }).onStepEnter((response) => {
      const index = response.index //we're defining the steps that are set up to be triggered. we'll base it on the element's index.
      //remember this is a zero-based indexing system, so the indexes start at 0.
      if (index === 0){ //let's hide our stuff so it doesn't show up right away wheen we load the scrolly
          hide('.axis-x')
          hide('.axis-y')
          hide('#year')
          hide('circle')
      } else if (index === 1) { 
          show('.axis-x')
          hide('.axis-y')
          hide('#year')
          hide('circle')
      } else if (index === 2){
          show('.axis-x')
          show('.axis-y')
          hide('#year')
          hide('circle')  
      } else if (index === 3){
          show('.axis-x')
          show('.axis-y')
          hide('#year')
          show('circle', .8)  
      } else if (index === 4){
          show('.axis-x')
          show('.axis-y')
          show('#year', .3)
          show('circle', .8)
          if (interval) clearInterval(interval)
      } else if (index === 5){
          show('.axis-x')
          show('.axis-y')
          show('#year', .3)
          show('circle', .8)
          // let's set it up so that the years are responsive to the scrolls
          // this is basically the same code as our last setInterval, when we animated this viz for the last time
          interval = setInterval(function(){
            if (year === 2021) { //we want the year to stop at 2021, so let's write an if statement
              return // an empty retrun just makes it stop
            } else {
              year = year + 1  //remember how we defined year as the earliest year so the animation could start there?
            }
            d3.select('#year').text(year) //change the text to the value of the "year" variable
            
            //now that we have a function that adds one year to every year for the animation
            //let's make an array that responses to the changing years
            //that way the circles can reference the data when the years change
            const yearData = data.filter(function(d) {
              if (+d.year === year) {
                return true
              } else {
                return false
              }
            })
            //we want the circles to reflect "yearData"
            d3.selectAll('circle')
              .data(yearData)
              .transition(100) //let's make the transition last 100 millisecond so that it runs smoothly
              .attr('cy', d => yScale(+d.life_expectancy))
              .attr('cx', d => xScale(+d.income_per_person))
              .attr('r', d => rScale(+d.population))
          
          //now that we've told setInterval what to loop, we're back at the end of the function
          }, 100)
      }
  }) 

// this is how we would do it without the function:
//let's load the opacity = 0 stuff now so it shows up naturally
// svg.select('.x-axis').attr('opacity', 0)
// svg.select('.y-axis').attr('opacity', 0)
// svg.select('#year').attr('opacity', 0)
// svg.selectAll('circle').attr('opacity', 0)
// scroller.setup({
    // step: '.step',
    // offset: .5
// }).onStepEnter(function(response) {
//         const index = response.index
//         if (index === 1) {
//             svg.select('.x-axis').transition(200).attr('opacity', 1)
//         } else if (index === 2) {
//             svg.select('.y-axis').transition(200).attr('opacity', 1)
//         } else if (index === 3) {
//             svg.selectAll('circle').transition(200).attr('opacity', .8) // we use selectAll here instead of select because we want all the circles
            //if we used select then it would only show the first circle
//         } else if (index === 4) {
//             svg.select('#year').transition(200).attr('opacity', .3)
//         }
//     })

})