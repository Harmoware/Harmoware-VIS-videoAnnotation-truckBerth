import React from 'react';
import { PointCloudLayer, SimpleMeshLayer, LineLayer } from 'deck.gl';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, FpsDisplay
} from 'harmoware-vis';
import Controller from '../components';
import VideoAnnotationLayer from '../layers/video-annotation-layer';

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; //Acquire Mapbox accesstoken

class App extends Container {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: 0,
      videoUrl: undefined,
      truckBerthData: null,
      berthDataArray: null,
      clickArea:[0,0,0,0],
      framePerPx:0
    };
    this.videoRef = React.createRef()
    this.currentTime = 0
  }

  componentDidMount(){
    super.componentDidMount();
    const { actions } = this.props;
    actions.setInitialViewChange(false);
    actions.setSecPerHour(3600);
    actions.setLeading(0);
    actions.setTrailing(0);
    actions.setAnimatePause(true);
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.on("playing",()=>{
        this.props.actions.setTimeBegin(0)
        this.props.actions.setTimeLength(this.videoRef.current.player.duration)
      })
      this.videoRef.current.player.on("error",(error)=>{
        console.log({error})
      })
    }
  }

  componentDidUpdate(){
    if(Math.abs(this.currentTime - this.videoRef.current.player.currentTime) >= (1/60)){
      this.currentTime = this.videoRef.current.player.currentTime
      this.props.actions.setTime(this.currentTime)
    }
  }

  updateState(updateData){
    this.setState(updateData);
  }

  updateCanvas(context,width,height,truckBerthData){
    const clientHeight = 250
    const start_x = 150
    const framecount = truckBerthData!==null ? truckBerthData.length : 0
    const graphwidth = width-start_x-50
    const framePerPx = framecount>0 ? graphwidth/framecount:0
    const rateStart_y = clientHeight+20
    this.setState({clickArea:[start_x,rateStart_y-15,start_x+graphwidth,rateStart_y+565],framePerPx})
    context.clearRect(0,0,width,height)
    context.textAlign="left";
    context.textBaseline="top";
    context.font = '12px sans-serif'
    context.lineWidth = 1
    context.fillStyle = 'yellow'
    context.fillText(`berth use rate`,30,rateStart_y)
    context.fillStyle = 'aqua'
    context.fillText(`door open rate`,30,rateStart_y+20)
    context.strokeStyle = '#CCCCCC'
    context.fillStyle = '#CCCCCC'
    context.strokeRect(start_x,rateStart_y,graphwidth,101)
    let berthCount = 15
    if(this.state.berthDataArray !== null){
      berthCount = this.state.berthDataArray.length
    }
    context.strokeRect(0,0,width,220)
    context.beginPath()
    context.moveTo(0,0)
    context.lineTo(width,0)
    const interval = width/berthCount
    let k = 0
    for(let i=0; i<=width; i=i+interval){
      context.moveTo(i,0)
      context.lineTo(i,220)
      context.fillText(`berth no.${berthCount-k}`,i+15,185)
      k=k+1
    }
    context.moveTo(0,220)
    context.lineTo(width,220)
    context.stroke()
    if(framecount>0){
      context.beginPath()
      for(let j=0; j<truckBerthData.length; j=j+100){
        context.moveTo(start_x+(j*framePerPx),rateStart_y-15)
        context.lineTo(start_x+(j*framePerPx),rateStart_y)
        context.fillText(`${j}`,start_x+(j*framePerPx)+2,rateStart_y-15)
      }
      context.stroke()
      context.strokeStyle = 'yellow'
      context.beginPath()
      for(let j=0; j<truckBerthData.length; j=j+1){
        const value = (truckBerthData[j].berthUseRete*100)-100
        if(j===0){
          context.moveTo(start_x+(j*framePerPx),rateStart_y-value)
        }else{
          context.lineTo(start_x+(j*framePerPx),rateStart_y-value)
        }
      }
      context.stroke()
      context.strokeStyle = 'aqua'
      context.beginPath()
      for(let j=0; j<truckBerthData.length; j=j+1){
        const value = (truckBerthData[j].doorOpenRete*100)-100
        if(j===0){
          context.moveTo(start_x+(j*framePerPx),rateStart_y-value)
        }else{
          context.lineTo(start_x+(j*framePerPx),rateStart_y-value)
        }
      }
      context.stroke()
      const operation = truckBerthData.map((data,idx)=>{
        const wk_x = start_x+(idx*framePerPx)
        const wkArray = [...data.berthData]
        wkArray.reverse()
        const berthBoxText = wkArray.map((berthData,idx)=>{
          const condition = berthData===1 ? 'open' : berthData===2 ? 'close' :""
          const shift = berthData===1 ? 15 : berthData===2 ? 55 :0
          return {fillText:{text:`${condition}`,x:(idx*interval)+shift,y:210},fillStyle:"#CCCCCC",font:'12px sans-serif'}
        })
        const berthText = data.berthData.map((berthData,idx)=>{
          const condition = berthData===1 ? 'open' : berthData===2 ? 'close' :""
          const condiShift = berthData===1 ? 0 : berthData===2 ? -5 : 0
          return {fillText:{text:`${condition}`,x:wk_x+2,y:clientHeight+155+(idx*30)+condiShift},fillStyle:"lime"}
        })
        return {...data,
          path:{coordinate:[[wk_x,rateStart_y-30],[wk_x,rateStart_y+565]],strokeStyle:"lime"},
          text:[{fillText:{text:`${data.frame}`,x:wk_x+2,y:rateStart_y-20},fillStyle:"lime"},
                {fillText:{text:`${(data.berthUseRete*100)|0}%`,x:wk_x+2,y:rateStart_y+112},fillStyle:"yellow"},
                {fillText:{text:`${(data.doorOpenRete*100)|0}%`,x:wk_x+30,y:rateStart_y+112},fillStyle:"aqua"},
                ...berthText, ...berthBoxText]
        }
      })
      const movesbase = [{operation}]
      this.props.actions.setMovesBase(movesbase)
    }
    for(let i=0; i<berthCount; i=i+1){
      context.strokeStyle = '#CCCCCC'
      const start_y = clientHeight+140+(i*30)
      context.fillText(`berth no.${i+1}`,50,start_y)
      context.strokeRect(start_x,start_y,graphwidth,24)
      context.strokeStyle = 'red'
      if(this.state.berthDataArray !== null){
        const currentdata = this.state.berthDataArray[i]
        const dataLength = currentdata.length
        context.beginPath()
        for(let j=0; j<dataLength; j=j+1){
          const value = (currentdata[j]*10)-20-2
          if(j===0){
            context.moveTo(start_x+(j*framePerPx),start_y-value)
          }else{
            context.lineTo(start_x+(j*framePerPx),start_y-value)
          }
        }
        context.stroke()
      }
    }
  }

  videoplay(){
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.play()
    }
  }
  videopause(){
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.pause()
    }
  }
  videorestart(){
    if(this.videoRef.current && this.videoRef.current.player){
      this.videoRef.current.player.restart()
      this.videoRef.current.player.play()
    }
  }
  canvasClick(viewX,viewY){
    const [x1=0,y1=0,x2=0,y2=0] = this.state.clickArea
    if(x1<viewX && viewX<x2 && y1<viewY && viewY<y2){
      const {duration=0} = this.videoRef.current ? this.videoRef.current.player :{}
      if(duration > 0 && x1 < x2){
        const unittime = duration / (x2 - x1)
        const setTime = unittime * (viewX - x1)
        this.props.actions.setTime(setTime);
        this.videoRef.current.player.currentTime = setTime
        console.log(`x:${viewX},y:${viewY}`)
      }
    }
  }

  render() {
    const { movedData } = this.props;
    const PathData = movedData
    const {berthUseRete,realtime,frame} = movedData.length>0 ? movedData[0] : {berthUseRete:0,realtime:0,frame:0}
    const {paused=false,currentTime=0,duration=0} = this.videoRef.current ? this.videoRef.current.player :{}
    const {clientWidth=0,clientHeight=0} = this.videoRef.current ? this.videoRef.current.videoRef.current :{}

    return (
      <div>

        <Controller {...this.props} {...this.state} updateState={this.updateState.bind(this)} realtime={realtime}
          paused={paused ? true : false} videoControl={this.videoRef.current&&this.videoRef.current.player}
          videoplay={this.videoplay.bind(this)} videopause={this.videopause.bind(this)} videorestart={this.videorestart.bind(this)}/>

          <CanvasComponent className="videoannotationlayer" videoUrl={this.state.videoUrl}
            width={clientWidth} height={900} updateCanvas={this.updateCanvas.bind(this)} truckBerthData={this.state.truckBerthData}/>

          <VideoAnnotationLayer ref={this.videoRef}
          videoUrl={this.state.videoUrl}
          AnnotationPropsArray={[{data:PathData}]}/>

          <MouseCaptureCanvas className="videoannotationlayer" canvasClick={this.canvasClick.bind(this)} width={clientWidth} height={900}/>

        <div className="harmovis_footer">
          videoWidth:{clientWidth}&nbsp;
          videoHeight:{clientHeight}&nbsp;
          berthUseRete:{(berthUseRete*100)|0}%&nbsp;
          realtime:{realtime|0}&nbsp;
          frame:{frame}&nbsp;
          videoDuration:{duration ? duration : 0}&nbsp;
          videoTime:{currentTime ? currentTime : 0}&nbsp;
        </div>
        <FpsDisplay />
      </div>
    );
  }
}
export default connectToHarmowareVis(App);

const CanvasComponent = (props)=>{
  const canvasRef = React.useRef(undefined);

  React.useEffect(()=>{
    if(canvasRef.current !== undefined){
      if(props.videoUrl){
        const context = canvasRef.current.getContext('2d');
        props.updateCanvas(context,props.width,props.height,props.truckBerthData);
      }
    }
  },[canvasRef,props.videoUrl,props.width,props.height,props.truckBerthData])

  const Result = React.useMemo(()=>
    <canvas ref={canvasRef} width={props.width} height={props.height} className={props.className}/>
  ,[props])

  return Result
}

const MouseCaptureCanvas = (props)=>{
  const canvasRef = React.useRef(undefined);

  React.useEffect(()=>{
    if(canvasRef.current !== undefined){
      canvasRef.current.onmousedown = function(e) {
        const rect = e.target.getBoundingClientRect();
        const viewX = e.clientX - rect.left
        const viewY = e.clientY - rect.top;
        props.canvasClick(viewX,viewY)
        canvasRef.current.onmousemove = function(e) {
          const rect = e.target.getBoundingClientRect();
          const viewX = e.clientX - rect.left
          const viewY = e.clientY - rect.top;
          props.canvasClick(viewX,viewY)
        }
      }
      canvasRef.current.onmouseup = function(e) {
        canvasRef.current.onmousemove = function(e) {}
      }
      canvasRef.current.onmouseover = function(e) {
        canvasRef.current.onmousemove = function(e) {}
      }
      canvasRef.current.onmouseout = function(e) {
        canvasRef.current.onmousemove = function(e) {}
      }
    }
  },[canvasRef])

  const Result = React.useMemo(()=>
    <canvas ref={canvasRef} width={props.width} height={props.height} className={props.className}/>
  ,[props])

  return Result
}
