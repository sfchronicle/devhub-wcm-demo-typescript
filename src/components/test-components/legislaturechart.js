import React, { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { useChartDimensions } from './helpers/charthelpers'
import getLegislaturePoints, {color, colorBase, colorVoting} from './helpers/legislaturechart-helpers'

// REFERENCE: -----------------
// Parliament layout:
// https://observablehq.com/@dkaoster/d3-parliament-chart
// https://github.com/dkaoster/d3-parliament-chart/blob/main/src/parliament-chart.js
// https://github.com/geoffreybr/d3-parliament/blob/master/d3-parliament.js

const returnPartySignifier = function(party) {
  // Truncate to first letter if Dem or GOP
  if (party == "GOP"){
    return "R";
  } else if (party == "Dem"){
    return "D";
  } else {
    // If it's a smaller party, return all letters
    return party;
  }
}

const LegislatureChart = ({
  type = 'senate',
  baseSeats = {},           // Object with key of party & value of number of seats
  calledSeats = null,       // Array of objects - races that have been called
  votingSeats = null,       // Array of objects - races that are still being voted on, above threshold
  subThresholdSeats = null, // Array of objects - races with % votes below threshold
  showTooltip = true,
}) => {
  // Margins of graphic
  const margins = {
    marginTop: 10,
    marginRight: 0,
    marginBottom: 10,
    marginLeft: 0
  }

  // Responsive dimensions
  const [ref, dms] = useChartDimensions(margins)
  const [height, setHeight] = useState(320)

  // Calculated variables for viz
  const [pointLocs, setPointLocs] = useState([])
  const [radius, setRadius] = useState(5)
  const [colorArr, setColorArr] = useState([])
  const [contentArr, setContentArr] = useState([])

  const makeColorArr = () => {
    let nSeats = (type === 'senate' ? 100 : 435)
    let tempColor = new Array(nSeats).fill(color('x'))
    let tempContent = new Array(nSeats).fill(null)
    let leftCount = 0
    let rightCount = 0

    // BASE COLORS - seats that aren't up for election
    // base colors - Independent and Dem on left
    if (baseSeats.Other) {
      for (let i = 0; i < baseSeats.Other; i++) {
        tempColor[i] = colorBase('Other')
        tempContent[i] = {
          text: 'Not up for election',
          party: 'Other',
        }
      }
      leftCount += baseSeats.Other
    }
    for (let i = 0; i < baseSeats.Dem ; i++) {
      tempColor[leftCount + i] = colorBase('Dem')
      tempContent[leftCount + i] = {
        text: 'Not up for election',
        party: 'Dem',
      }
    }
    leftCount += baseSeats.Dem

    // base colors - GOP on right
    for (let i = 0; i < baseSeats.GOP; i++) {
      tempColor[nSeats - i - 1] = colorBase('GOP')
      tempContent[nSeats - i - 1] = {
        text: 'Not up for election',
        party: 'GOP',
      }
    }
    rightCount += baseSeats.GOP


    // CALLED SEATS - LEFT
    let calledLeft = calledSeats
      .filter(d => d.winner.party !== 'GOP')
    for (let i = 0; i < calledLeft.length; i++) {
      tempColor[leftCount + i] = color(calledLeft[i].winner.party)
      tempContent[leftCount + i] = {
        text: 'Winner',
        name: calledLeft[i].winner.name,
        party: calledLeft[i].winner.party,
        office: calledLeft[i].office,
        voteShare: calledLeft[i].winner.voteShare,
        votePercent: calledLeft[i].votePercent,
        unopposed: (calledLeft[i].candidates.length === 1),
      }
    }
    leftCount += calledLeft.length

    // CALLED SEATS - RIGHT
    let calledRight = calledSeats
      .filter(d => d.winner.party === 'GOP')
    for (let i = 0; i < calledRight.length; i++) {
      tempColor[nSeats - rightCount - i - 1] = color(calledRight[i].winner.party)
      tempContent[nSeats - rightCount - i - 1] = {
        text: 'Winner',
        name: calledRight[i].winner.name,
        party: calledRight[i].winner.party,
        office: calledRight[i].office,
        voteShare: calledRight[i].winner.voteShare,
        votePercent: calledRight[i].votePercent,
        unopposed: (calledRight[i].candidates.length === 1),
      }
    }
    rightCount += calledRight.length

    // VOTING SEATS - LEFT
    let votingLeft = votingSeats
      .filter(d => d.leader.party !== 'GOP')
    // console.log(votingLeft)
    for (let i = 0; i < votingLeft.length; i++) {
      tempColor[leftCount + i] = colorVoting(votingLeft[i].leader.party)
      tempContent[leftCount + i] = {
        text: 'Leaning',
        name: votingLeft[i].leader.name,
        party: votingLeft[i].leader.party,
        office: votingLeft[i].office,
        voteShare: votingLeft[i].leader.voteShare,
        votePercent: votingLeft[i].votePercent,
        unopposed: (votingLeft[i].candidates.length === 1),
      }
    }
    leftCount += votingLeft.length

    // VOTING SEATS - RIGHT
    let votingRight = votingSeats
      .filter(d => d.leader.party === 'GOP')
    for (let i = 0; i < votingRight.length; i++) {
      tempColor[nSeats - rightCount - i - 1] = colorVoting(votingRight[i].leader.party)
      tempContent[nSeats - rightCount - i - 1] = {
        text: 'Leaning',
        name: votingRight[i].leader.name,
        party: votingRight[i].leader.party,
        office: votingRight[i].office,
        voteShare: votingRight[i].leader.voteShare,
        votePercent: votingRight[i].votePercent,
        unopposed: (votingRight[i].candidates.length === 1),
      }
    }
    rightCount += votingRight.length

    // SUBTHRESHOLD SEATS
    for (let i = 0; i < subThresholdSeats.length; i++) {
      tempColor[leftCount + i] = colorVoting('x')
      
      tempContent[leftCount + i] = {
        text: 'Pending',
        votePercent: subThresholdSeats[i].votePercent,
        office: subThresholdSeats[i].office,
        unopposed: (subThresholdSeats[i].candidates.length === 1),
      }
    }
    leftCount += subThresholdSeats.length

    setColorArr(tempColor)
    setContentArr(tempContent)
    // console.log('calledSeats', calledSeats.map(d => d.winner.party))
    // if(calledLeft.length) console.log('colors', color('Other'), calledLeft[0].winner.party, color(calledLeft[0].winner.party))
    // console.log('colors', tempColor)
  }

  useEffect(() => {
    if (!calledSeats) return

    makeColorArr()

    ReactTooltip.rebuild()
  }, [calledSeats, votingSeats, subThresholdSeats])

  useEffect(() => {
    if (!dms.width) return

    // Calculate height
    setHeight((dms.width / 2) + 20)

    // Calculate locations of all the points
    let nSeats
    // Chart options
    let options = {
      sections: 1,        // Number of sections to divide the half circle into
      sectionGap: 0,      // The gap of the aisle between sections
      seatRadius: 5,      // The radius of each seat
      rowHeight: 20,      // The height of each row
    }
    if (type === 'senate') {
      nSeats = 100
      const r = 13.5, rowHeight = 33, setR = 10

      if (dms.width < 600) {
        const newR = r / 600 * dms.width
        options.rowHeight = rowHeight / 600 * dms.width
        options.seatRadius = newR
        setRadius(9 / 600 * dms.width)
      } else {
        options.rowHeight = rowHeight
        options.seatRadius = r
        setRadius(setR)
      }
    } else {
      nSeats = 435

      if (dms.width < 600) {
        const newR = 5 / 600 * dms.width
        options.rowHeight = 20 / 600 * dms.width
        options.seatRadius = newR
        setRadius(newR)
      }
    }
    const locations = getLegislaturePoints(nSeats, options, dms.width)
    setPointLocs(locations)

  }, [dms.width])

  const shortOfficeName = (name) => {
    return name
      .replace(' District ', '-')
      .replace(' Unexpired Term', '')
  }


  return <div
    id={`legislature-seats-${type}`}
    className='chart legislature-chart'
    role='img'
    aria-label={`
      A visualization showing control over the U.S. 
      ${type === 'senate' ? 'Senate' : 'House of Represenatives'}. 
      It shows dots arranged in a semicircle representing the 
      ${type === 'senate' ? 100 : 435} seats, 
      with blue dots for Democrats, red dots for Republicans,
      ${contentArr.filter(d => d && d.party && d.party === 'Grn').length > 0 ? 'green dots for Green Party,' : ''}
      and yellow dots for Independents. Leading candidates are colored with lighter dots.
    `}
    aria-flowto={`legislature-bar-${type}`}
    ref={ref}
    style={{
      width: '100%',
      height: `${height}px`,
      margin: 'auto',
    }}
  >
    <svg
      width={dms.width}
      height={dms.height}
      id={`legislature-seats-${type}-svg`}
    >
    {type === 'senate' && 
      <g transform={
        dms.width < 600 ? `scale(${dms.width/600}) ${dms.width < 500 ? `translate(0 ${radius})` : ''}` : ''
      }>
        <path style={{fill:'#E1E1E1',stroke:'#B8B8B8',strokeMiterlimit:10}} d="M205.1,56.4L190,30.1c-10.6,4.2-20.9,9-30.9,14.3C64.5,94.8,0,194.5,0,309.3c0,0.9,0,1.8,0,2.7h160
          c0-0.9,0-1.8,0-2.7c0-54.1,33-100.7,80.6-122.3L174.1,70.4C184.1,65.1,194.4,60.5,205.1,56.4z"/>
        <path style={{fill:'#E1E1E1',stroke:'#B8B8B8',strokeMiterlimit:10}} d="M498.5,84.3L482.9,108c-8.5-7.9-17.5-12.4-26.9-19.1l-23.7,41.1l-26.6,46.2L389,205.1
          c9.2,7.3,17.4,15.8,24.4,25.1c16.7,22.2,26.5,49.5,26.5,79.1c0,0.9,0,1.8,0,2.7h160c0-0.9,0-1.8,0-2.7
          C600,219.7,560.7,139.3,498.5,84.3z"/>
      </g>
    }
      <g 
        transform={`translate(${margins.marginLeft} ${margins.marginTop})`}
        className={showTooltip ? 'has-tooltip' : ''}
      >
      {
        pointLocs.map((pt,i) =>
          <circle
            r={radius}
            cx={pt.x}
            cy={pt.y}
            fill={colorArr[i]}
            stroke={'#999999'}
            strokeWidth={colorArr[i] === color('x') ? 1.2 : 0}
            data-delay-show='0'
            data-for={`tooltip-seats-${type}`}
            data-tip={i}
            // data-delay-hide='10000'
          />
        )
      }
      </g>
    </svg>
    {showTooltip &&
      <ReactTooltip 
        place='top' 
        type='light'
        effect='float' 
        // effect='solid' 
        id={`tooltip-seats-${type}`}
        getContent={(i) => {
          return (contentArr[i] ?
            <div className='tooltipText'>
              <div className='tooltipText-type'>
                {contentArr[i].text}
                {!contentArr[i].name && contentArr[i].party && 
                  <span className={contentArr[i].party + " pol-party"}>{returnPartySignifier(contentArr[i].party)}</span>
                }
              </div>
              {contentArr[i].name &&
                <>
                <hr />
                <div className='tooltipText-name'>
                  {contentArr[i].name} ({shortOfficeName(contentArr[i].office)})
                  <span className={contentArr[i].party + " pol-party"}>{returnPartySignifier(contentArr[i].party)}</span>
                </div>
                </>
              }
              {!contentArr[i].name && contentArr[i].office &&
                <>
                <hr />
                <div className='tooltipText-name'>
                  {shortOfficeName(contentArr[i].office)}
                </div>
                </>
              }
              {contentArr[i].votePercent !== null && contentArr[i].text !== 'Not up for election' &&
                <div className='tooltipText-percent'>
                  {contentArr[i].unopposed ?
                    "Unopposed"
                  :
                    `${contentArr[i].votePercent.toFixed(1)}% of votes received`
                  }
                </div>
              }
            </div>
            :
            <div className='tooltipText'>
              Not enough data
            </div>
          )
        }}
      />
    }
  </div>

}

export default LegislatureChart 