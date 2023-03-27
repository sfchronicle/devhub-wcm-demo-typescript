import React, { useEffect, useState, Fragment } from 'react'
import { useChartDimensions } from './helpers/charthelpers'
import {color, colorBase, colorVoting} from './helpers/legislaturechart-helpers'

// REFERENCE: -----------------
// Parliament layout:
// https://observablehq.com/@dkaoster/d3-parliament-chart
// https://github.com/dkaoster/d3-parliament-chart/blob/main/src/parliament-chart.js
// https://github.com/geoffreybr/d3-parliament/blob/master/d3-parliament.js

const LegislatureBar = ({
  type = 'senate',
  baseSeats = {},     // Object with key of party & value of number of seats
  calledSeats = {},   // Object with key of party & value of number of seats
  votingSeats = {},   // Object with key of party & value of number of seats; also key "sub" with those below threshold
}) => {
  // Margins of graphic
  const margins = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0
  }
  // Margin between rectangles
  const spacer = 4

  // Responsive dimensions
  const [ref, dms] = useChartDimensions(margins)

  // Calculated variables for viz
  const [leftColors, setLeftColors] = useState([])
  const [midColors, setMidColors] = useState([])
  const [rightColors, setRightColors] = useState([])
  const [rectWidths, setRectWidths] = useState({
    left: 0, mid: 0, right: 0
  })
  const [bigNumbers, setBigNumbers] = useState({
    Dem: 0,
    GOP: 0
  })
  const nSeats = (type === 'senate' ? 100 : 435)

  const makePercColors = () => {
    let leftCount = 0
    let tempPercColors = []
    let tempRectWidths = {left: 0, mid: 0,right: 0}

    // BASE SEATS - Independent and Dem on left
    // seats that aren't for election
    if (baseSeats.Other) {
      tempPercColors.push({
        type: 'base',
        party: 'Other',
        color: colorBase('Other'),
        start: leftCount,
        end: baseSeats.Other + leftCount
      })
      leftCount += baseSeats.Other
      tempRectWidths.left += baseSeats.Other
    }

    tempPercColors.push({
      type: 'base',
      party: 'Dem',
      color: colorBase('Dem'),
      start: leftCount,
      end: baseSeats.Dem + leftCount
    })
    leftCount += baseSeats.Dem
    tempRectWidths.left += baseSeats.Dem

    setLeftColors(tempPercColors)
    leftCount = 0
    tempPercColors = []

    // CALLED SEATS - left
    Object.keys(calledSeats).forEach(party => {
      if (!party.includes('GOP') && calledSeats[party] > 0) {
        tempPercColors.push({
          type: 'called',
          party: party,
          color: color(party),
          start: leftCount,
          end: calledSeats[party] + leftCount
        })
        leftCount += calledSeats[party]
        tempRectWidths.mid += calledSeats[party]
      }
    })

    // VOTING SEATS - left
    Object.keys(votingSeats).forEach(party => {
      if (!party.includes('GOP') && party !== 'x' &&  votingSeats[party] > 0) {
        tempPercColors.push({
          type: 'voting',
          party: party,
          color: colorVoting(party),
          start: leftCount,
          end: votingSeats[party] + leftCount
        })
        leftCount += votingSeats[party]
        tempRectWidths.mid += votingSeats[party]
      }
    })

    // SUBTHRESHOLD SEATS w/ EMPTY SEATS (half on each side)
    tempPercColors.push({
      type: 'empty',
      party: 'empty',
      color: colorVoting('x'),
      start: leftCount,
      end: votingSeats['x'] + leftCount
    })
    leftCount += votingSeats['x']
    tempRectWidths.mid += votingSeats['x']

    // VOTING SEATS - right
    tempPercColors.push({
      type: 'voting',
      party: 'GOP',
      color: colorVoting('GOP'),
      start: leftCount,
      end: votingSeats.GOP + leftCount
    })
    leftCount += votingSeats.GOP
    tempRectWidths.mid += votingSeats.GOP

    // CALLED SEATS - right
    tempPercColors.push({
      type: 'called',
      party: 'GOP',
      color: color('GOP'),
      start: leftCount,
      end: calledSeats.GOP + leftCount
    })
    leftCount += calledSeats.GOP
    tempRectWidths.mid += calledSeats.GOP
    setMidColors(tempPercColors)
    leftCount = 0
    tempPercColors = []

    // BASE SEATS - right
    tempPercColors.push({
      type: 'base',
      party: 'GOP',
      color: colorBase('GOP'),
      start: leftCount,
      end: baseSeats.GOP + leftCount
    })
    leftCount += calledSeats.GOP
    tempRectWidths.right += baseSeats.GOP
    setRightColors(tempPercColors)

    setRectWidths(tempRectWidths)
    // console.log({type, baseSeats, votingSeats, calledSeats, tempPercColors})

  }

  const makeNumbers = (seats) => {
    // calculate number of seats on left
    let leftNum = 0
    Object.keys(seats).forEach(party => {
      if (!party.includes('GOP')) leftNum += seats[party]
    })

    setBigNumbers({
      Dem: leftNum,
      GOP: seats.GOP
    })
  }

  useEffect(() => {
    makeNumbers(baseSeats)
  }, [])

  useEffect(() => {
    makePercColors()

    //combine baseSeats with calledSeats
    let addedSeats = {}
    const parties = Object.keys(baseSeats).concat(Object.keys(calledSeats))
    parties.forEach(function(party){
      const base = (baseSeats[party] ? baseSeats[party] : 0)
      const called = (calledSeats[party] ? calledSeats[party] : 0)
      addedSeats[party] = base+called
    })
    // console.log({party, baseSeats, calledSeats, addedSeats})
    makeNumbers(addedSeats)

  }, [calledSeats, votingSeats])

  useEffect(() => {
    if (!dms.width) return
  }, [dms.width])



  return <div
    id={`legislature-bar-${type}`}
    className='chart legislature-bar' 
    ref={ref}
    style={{
      width: '100%',
      margin: '0 auto 0em',
    }}
    role='img'
    aria-label={`
      A bar chart summarizing the number of seats that are not yet up for
      elections this year or have already been called. So far, 
      ${bigNumbers.Dem} seats have been called for Democrats and Independents,
      and ${bigNumbers.GOP} seats are called for Republicans.
    `}
  >
    <svg
      width={dms.width}
      height={'60px'}
      id={`legislature-bar-${type}-svg`}
    >
      <defs>
        <linearGradient id={`gradient-${type}-left`}>
          {
            leftColors
            .map(d => 
              <Fragment>
                <stop offset={`${d.start / rectWidths.left * 100}%`} stop-color={d.color} />
                <stop offset={`${d.end / rectWidths.left * 100}%`} stop-color={d.color} />
              </Fragment>
            )
          }
        </linearGradient>
        <linearGradient id={`gradient-${type}-mid`}>
          {
            midColors
            .map(d => 
              <Fragment>
                <stop offset={`${d.start / rectWidths.mid * 100}%`} stop-color={d.color} />
                <stop offset={`${d.end / rectWidths.mid * 100}%`} stop-color={d.color} />
              </Fragment>
            )
          }
        </linearGradient>
        <linearGradient id={`gradient-${type}-right`}>
          {
            rightColors.map(d => 
              <Fragment>
                <stop offset={`${d.start / rectWidths.right * 100}%`} stop-color={d.color} />
                <stop offset={`${d.end / rectWidths.right * 100}%`} stop-color={d.color} />
              </Fragment>
            )
          }
        </linearGradient>
      </defs>
      <g transform={`translate(${margins.marginLeft} ${margins.marginTop + 40})`}>
        {
          type=='senate' && <rect
            fill={`url(#gradient-${type}-left)`}
            width={(rectWidths.left / nSeats) * (dms.width - 2*spacer)}
            x='0'
            height='18'
          />
        }
        <rect
          fill={`url(#gradient-${type}-mid)`}
          width={(rectWidths.mid / nSeats) * (dms.width - 2*spacer)}
          x={((rectWidths.left / nSeats) * (dms.width - 2*spacer)) + spacer}
          y={0.5}
          height='17'
          stroke='#999999'
          strokeWidth={1}
        />
        {
          type=='senate' && <rect
            fill={`url(#gradient-${type}-right)`}
            width={(rectWidths.right / nSeats) * (dms.width - 2*spacer)}
            x={dms.width - (rectWidths.right / nSeats) * (dms.width - 2*spacer)}
            height='18'
          />
        }
      </g>
      <g
        className='majority-tick'
        aria-hidden='true'
        transform={`translate(${dms.width / 2} ${margins.marginTop + 40 - 5})`}
      >
        <line
          x1={0} x2={0}
          y1={0} y2={4}
          stroke='#999999'
          strokeWidth={1}
        />
        <text
          text-anchor='middle'
          dy={-2}
          fill='#333'
        >
          Majority
        </text>
      </g>
      <g 
        className='numbers' 
        aria-hidden='true'
        transform={`translate(0 ${margins.marginTop + 30})`}
      >
        <text 
          transform={`translate(${margins.marginLeft} 0)`}
          fill={colorBase('Dem')}
        >
          {bigNumbers.Dem}
        </text>
        <text 
          transform={`translate(${dms.width - margins.marginRight} 0)`}
          text-anchor='end'
          fill={colorBase('GOP')}
        >
          {bigNumbers.GOP}
        </text>
      </g>
      {type === 'senate' &&
        <g 
          className='labels'
          aria-hidden='true'
        >
          <text 
            transform={`translate(${margins.marginLeft} ${margins.marginTop + 58})`}
            y={-6}
            x={3}
          >
            Not up for election
          </text>
          <text 
            transform={`translate(${dms.width - margins.marginRight} ${margins.marginTop + 58})`}
            y={-6}
            x={-3}
            text-anchor='end'
          >
            Not up for election
          </text>
        </g>
      }
    </svg>
    <div 
      className='bars-labels'
      aria-hidden='true'
    >
      <div>
        <b>Democrats</b> &&nbsp;Independents
      </div>
      <div>
        <b>Republicans</b>
      </div>
    </div>
  </div>

}

export default LegislatureBar 