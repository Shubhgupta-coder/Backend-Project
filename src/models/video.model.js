import mongoose,{Schema} from "mongoose";
// it will help us to write aggregrate queries in mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile :
        {
            type:String,   //from cloudinary
            required:true
        },
        thumbnail:
        {
            type:String,
            required:true
        },
        title:
        {
            type:String,
            required:true
        },
        description:
        {
            type:String,
            required:true
        },
        duration:
        {
            type:Number,    //from cloudinary
            required:true
        },
        views:
        {
            type:Number,
            default:0
        },
        isPublished:
        {
            type:Boolean,
            default:true
        },
        owner:
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamps:true
    }
)

// We can ADD aggrgation pipelines as a plugin

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema);