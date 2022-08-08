import React from 'react';
import Plyr from 'plyr';

class VideoAnnotationLayer extends React.Component{
    constructor(props){
        super(props)
        this.videoRef = React.createRef()
        this.player = undefined
    }

    componentDidMount(){
        if(this.videoRef.current){
            if(this.player === undefined){
                this.player = new Plyr(this.videoRef.current,{controls:[]});
            }
        }
    }
    componentDidUpdate(prevProps){
        if(this.videoRef.current){
            if(this.player === undefined){
                this.player = new Plyr(this.videoRef.current,{controls:[]});
            }
        }
        if(prevProps.videoUrl !== this.props.videoUrl){
            if(this.player !== undefined){
                this.player.source = this.props.videoUrl
                this.player.restart()
            }
        }
    }

    render(){
        if(this.props.videoUrl){
            const videoWidth = this.videoRef.current ? this.videoRef.current.clientWidth:0
            const videoHeight = this.videoRef.current ? this.videoRef.current.clientHeight:0
            return (    
                <>
                <video ref={this.videoRef} className={this.props.className} width={1605}
                    id={this.props.id} muted={this.props.muted} loop={this.props.loop}
                    autoPlay={this.props.autoPlay} controls={this.props.controls}
                    src={this.props.videoUrl}>
                    非対応の動画データ
                </video>
                {this.props.AnnotationPropsArray.map((AnnotationProps,idx)=>
                    <AnnotationLayer key={idx} width={videoWidth} height={900}
                        className={AnnotationProps.className||this.props.className}
                        data={AnnotationProps.data}/>)}
                </>
            )
        }else{
            return (
                <video ref={this.videoRef} className={this.props.className}
                    id={this.props.id} muted={this.props.muted} >
                    非対応の動画データ
                </video>
            )
        }
    }
}
VideoAnnotationLayer.defaultProps = {
    id:'#player',
    className:'videoannotationlayer',
    autoPlay: true,
    controls: false,
    muted: false,
    loop: false
}
export default VideoAnnotationLayer

const AnnotationLayer = (props)=>{
    const canvasRef = React.useRef(undefined)
    const [context,setcontext] = React.useState(undefined)

    React.useEffect(()=>{
        if(canvasRef.current !== undefined){
            const context = canvasRef.current.getContext('2d')
            setcontext(context)
        }
    },[canvasRef])

    React.useEffect(()=>{
        if(context !== undefined){
            updateCanvas(context,props.data,props.width,props.height)
        }
    },[context,props.data,props.width,props.height])

    return (
        <canvas className={props.className}
            ref={canvasRef} width={props.width} height={props.height} />
    )
}
AnnotationLayer.defaultProps = {
    width:0, height:0, data:[]
}

const updateCanvas = (context,annotationDataArray,canvasWidth,canvasHeight)=>{
    context.clearRect(0,0,canvasWidth,canvasHeight)
    for(let i=0; i<annotationDataArray.length; i=i+1){
        const annotationData = annotationDataArray[i]
        if(annotationData.path){
            let pathArray = []
            if(Array.isArray(annotationData.path)){
                pathArray = annotationData.path
            }else{
                pathArray = [annotationData.path]
            }
            for(const path of pathArray){
                const {coordinate,strokeStyle,lineWidth,globalAlpha} = path
                if(coordinate && Array.isArray(coordinate)){
                    context.beginPath()
                    for(let j=0; j<coordinate.length; j=j+1){
                        if(coordinate[j].length >= 2){
                            if(j===0){
                                context.moveTo(coordinate[j][0],coordinate[j][1])
                            }else{
                                context.lineTo(coordinate[j][0],coordinate[j][1])
                            }
                        }
                    }
                    if(coordinate.length > 1){
                        const lastIdx = coordinate.length-1
                        if(coordinate[0].length >= 2 && coordinate[lastIdx].length >= 2){
                            if(coordinate[0][0] === coordinate[lastIdx][0] && coordinate[0][1] === coordinate[lastIdx][1]){
                                context.closePath()
                            }
                        }
                    }
                    context.strokeStyle = strokeStyle || 'black'
                    context.lineWidth = lineWidth || 1
                    context.globalAlpha = globalAlpha || 1
                    context.stroke()
                }
            }
        }
        if(annotationData.polygon){
            let polygonArray = []
            if(Array.isArray(annotationData.polygon)){
                polygonArray = annotationData.polygon
            }else{
                polygonArray = [annotationData.polygon]
            }
            for(const polygon of polygonArray){
                const {coordinate,fillStyle,strokeStyle,lineWidth,globalAlpha} = polygon
                if(coordinate && Array.isArray(coordinate)){
                    context.beginPath()
                    for(let j=0; j<coordinate.length; j=j+1){
                        if(coordinate[j].length >=2 ){
                            if(j===0){
                                context.moveTo(coordinate[j][0],coordinate[j][1])
                            }else{
                                context.lineTo(coordinate[j][0],coordinate[j][1])
                            }
                        }
                    }
                    context.closePath()
                    context.fillStyle = fillStyle || 'black'
                    context.globalAlpha = globalAlpha || 1
                    context.fill()
                    context.lineWidth = lineWidth || 1
                    context.strokeStyle = strokeStyle || 'black'
                    if(lineWidth || strokeStyle){
                        context.stroke()
                    }
                }
            }
        }
        if(annotationData.text){
            let textArray = []
            if(Array.isArray(annotationData.text)){
                textArray = annotationData.text
            }else{
                textArray = [annotationData.text]
            }
            for(const text of textArray){
                const {fillText,strokeText,fillStyle,strokeStyle,font,globalAlpha} = text
                if(fillText || strokeText){
                    context.font = font || '10px sans-serif'
                    context.globalAlpha = globalAlpha || 1
                    if(fillText){
                        const {text,x,y} = fillText
                        if(text && x && y){
                            context.fillStyle = fillStyle || 'black'
                            context.fillText(text,x,y)
                        }
                    }
                    if(strokeText){
                        const {text,x,y} = strokeText
                        if(text && x && y){
                            context.strokeStyle = strokeStyle || 'black'
                            context.strokeText(text,x,y)
                        }
                    }
                }
            }
        }
    }
}