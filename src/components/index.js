import React from 'react';
import { TruckBerthInput } from './truck-berth-input';
import { VideoInput } from './video-input';

export default class Controller extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      hiduke: null,
      speed:1,
      videoFps: 30,
      realFrameInterval: (26100/3196)
    }
  }

  setTime(e){
    const { actions, videoControl } = this.props;
    if(videoControl){
      actions.setTime(+e.target.value);
      videoControl.currentTime = +e.target.value
    }
  }
  setSpeed(e){
    const { videoControl } = this.props;
    if(videoControl){
      const speed = +e.target.value
      this.setState({speed})
      videoControl.speed = speed
    }
  }
  setRealTime(e){
    if(e.target.value.length > 0){
      const hiduke = new Date(e.target.value)
      this.setState({hiduke})
    }else{
      this.setState({hiduke:null})
    }
  }

  render() {
    const { actions, inputFileName, truckBerthData, videoplay, videopause, videorestart, paused,
      updateState, videoControl, realtime } = this.props;
    const { truckBerthFileName } = inputFileName;
    const {currentTime=0,duration=0} = videoControl ? videoControl :{}
    const framecount = truckBerthData!==null ? truckBerthData.length-1 : 1

    return (
        <div className="harmovis_controller">
            <ul className="flex_list">
            <li className="flex_column">
              <VideoInput updateState={updateState}/>
            </li>
            <li className="flex_row">
                <div className="harmovis_input_button_column" title='3D object data selection'>
                <label htmlFor="TruckBerthInput">
                TruckBerth Data Selection
                <TruckBerthInput actions={actions} id="TruckBerthInput" updateState={updateState}
                videoFps={this.state.videoFps} realFrameInterval={this.state.realFrameInterval}/>
                </label>
                <div>{truckBerthFileName}</div>
                </div>
            </li>
            <li className="flex_column">
              <label htmlFor="realtime">realtime (sec)</label>
                <input type="number" value={realtime|0} className='harmovis_input_number' disabled id="realtime"/>
            </li>
            <li className="flex_column">
              <label htmlFor="RealTimeInput">start realtime:</label>
                <input type="datetime-local" onChange={this.setRealTime.bind(this)} id="RealTimeInput"/>
            </li>
            <li className="flex_column">
              realtime&nbsp;:&nbsp;<SimulationDateTime hiduke={this.state.hiduke} realtime={realtime|0}/>
            </li>
            <li className="flex_column">
              <label htmlFor="ElapsedTimeRange">videoTime (sec)</label>
                <input type="number" value={currentTime|0} className='harmovis_input_number'
                  min={0} max={duration} onChange={this.setTime.bind(this)} />
            </li>
            <li className="flex_column">
              <input type="range" value={currentTime} min={0} max={duration} step={(duration/framecount)} style={{'width':'100%'}}
                onChange={this.setTime.bind(this)} className='harmovis_input_range' />
            </li>

            <li className="flex_row">
              {paused ?
              <button onClick={videoplay} className="harmovis_button">play</button>:
              <button onClick={videopause} className="harmovis_button">pause</button>
              }
              <button onClick={videorestart} className="harmovis_button">restart</button>
            </li>
            <li className="flex_column">
              <span>speed&nbsp;</span>
              <input type="range" value={this.state.speed} min={0.1} max={1} step={0.1} style={{'width':'100%'}}
                onChange={this.setSpeed.bind(this)} className='harmovis_input_range' />
            </li>
            </ul>
        </div>
    );
  }
}

const SimulationDateTime = (props)=>{
  const { realtime, hiduke, locales, options, className } = props;
  let date = new Date();
  if(hiduke!==null){
    const unix_hiduke = hiduke.getTime()
    date = new Date((realtime * 1000) + unix_hiduke);
  }
  const dateString = date.toLocaleString(locales, options)

  return (
    <>
    {hiduke === null ? null:
    <span className={className}>
      {dateString}
    </span>}
    </>
  )
}
SimulationDateTime.defaultProps = {
  locales: 'ja-JP',
  options: { year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short' },
}
