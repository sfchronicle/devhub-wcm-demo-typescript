import React, { useEffect, useState, Fragment } from 'react'
import {color, colorBase, colorVoting} from './helpers/legislaturechart-helpers'

// REFERENCE: -----------------
// Parliament layout:
// https://observablehq.com/@dkaoster/d3-parliament-chart
// https://github.com/dkaoster/d3-parliament-chart/blob/main/src/parliament-chart.js
// https://github.com/geoffreybr/d3-parliament/blob/master/d3-parliament.js

const LegislatureLegend = () => {
  const text = ['Not up for election', 'Called', 'Leaning']

  return <div
    className='legislature-legend' 
    aria-hidden='true'
    // aria-label={`A legend showing color meanings. 
    //   Darker colors denote seats not up for election; 
    //   bright colors represent races that are called; 
    //   pastel colors represent races that have a leaning.`}
    style={{
      width: '100%',
      maxWidth: '500px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      margin: '0 auto 1em',
    }}
  >
    {[colorBase, color, colorVoting].map((colorScale, i) => 
      <div className='legend-group' style={{display: 'flex'}}>
        <span className='dots-group'  style={{
          marginRight: '0.25em',
          backgroundColor: (i === 0 ? '#E1E1E1' : ''),
          border: (i === 0 ? '1px solid #B8B8B8' : ''),
          padding: '0.25em',
          display: 'inline-flex',
        }}>
        {
          ['Dem', 'Grn', 'Other', 'GOP'].map((party, j) => 
            <span className='dot' style={{
              backgroundColor: colorScale(party),
              width: '1em',
              height: '1em',
              borderRadius: '50%',
              border: `1px solid ${i === 0 ? '#E1E1E1' : 'white'}`,
              display: 'inline-block',
              marginLeft: (j !== 0 ? '-0.4em' : '')
            }} />
          )
        }
        </span>
        {text[i]}
      </div>
    )}
  </div>

}

export default LegislatureLegend