import useBreakpoint from '../../../../hooks/use-breakpoint'
import { useAnalysisStore } from '../../../../stores/analysis.store'
import { AdjustmentRequestType } from '../../../../types/ai.type'
import { Eyebrow } from '../../eyebrow-store'
import { EyebrowList } from '../eyebrow-list'
import { PlacedBox } from '../result-analyzer/face-analyzer-img'

interface ControlsProps {
    onParamChange?: (config: AdjustmentRequestType) => void // Callback khi tham số thay đổi

    // Double cick
    onDoubleClick?: (eyebrow: Eyebrow) => void
    availableEyebrows: Eyebrow[]
    placedBoxes: PlacedBox[]
}

export default function Controls({ onDoubleClick, availableEyebrows, placedBoxes }: ControlsProps) {
    const { isCallParamChange } = useAnalysisStore()
    const breakpoints = useBreakpoint()

    // State cấu hình chính
    // const [, setConfig] = useState<AdjustmentRequestType>({
    //     input_image: DEFAULT_CONFIG_ADJUSTMENT.INPUT_IMAGE, // Hình ảnh đầu vào dạng base64
    //     eyebrow_left_path: DEFAULT_CONFIG_ADJUSTMENT.EYEBROW_LEFT_PATH, // Mặc định chọn mẫu chân mày đầu tiên
    //     apply_makeup: DEFAULT_CONFIG_ADJUSTMENT.APPLY_MAKEUP, // Không áp dụng trang điểm
    //     show_landmarks: DEFAULT_CONFIG_ADJUSTMENT.SHOW_LANDMARKS, // Hiển thị điểm đánh dấu
    //     definition: DEFAULT_CONFIG_ADJUSTMENT.DEFINITION, // Định nghĩa sắc nét
    //     color_eyebrow: DEFAULT_CONFIG_ADJUSTMENT.COLOR_EYEBROW, // Màu mặc định (màu gốc)
    //     remove_eyebrows: DEFAULT_CONFIG_ADJUSTMENT.REMOVE_EYEBROWS, // Không xóa chân mày gốc
    //     adjust_params: {
    //         left: { ...DEFAULT_LEFT_PARAMS },
    //         right: { ...DEFAULT_RIGHT_PARAMS }
    //     }
    // })

    // Cập nhật lại bộ tham số khi có thay đổi
    // const updateConfig = (newConfig: AdjustmentRequestType) => {
    //     setConfig(newConfig)

    //     // Gọi API nếu callback tồn tại
    //     if (onParamChange) {
    //         try {
    //             onParamChange(newConfig)
    //         } catch (error) {
    //             console.error('Error calling API:', error)
    //         }
    //     }
    // }

    return (
        <section className='w-full lg:px-1'>
            {/* Toggle điểm đánh dấu */}
            {isCallParamChange ? (
                <div className='flex items-center gap-2 mb-4 mt-5'>
                    <div className='w-10 h-6 bg-gray-200 rounded-full animate-pulse' />
                    <div className='w-24 h-3 bg-gray-200 rounded animate-pulse' />
                </div>
            ) : (
                // <div className='flex items-center gap-2 mb-4 mt-5'>
                //     <div className='relative inline-flex'>
                //         <input
                //             type='checkbox'
                //             id='landmarksToggle'
                //             className='sr-only peer'
                //             checked={config.show_landmarks}
                //             onChange={(e) =>
                //                 updateConfig({
                //                     ...config,
                //                     show_landmarks: e.target.checked
                //                 })
                //             }
                //         />
                //         <label
                //             htmlFor='landmarksToggle'
                //             className='flex w-10 h-5 cursor-pointer rounded-full bg-gray-300 peer-checked:bg-indigo-500
                //           after:content-[""] after:absolute after:top-0.5 after:left-0.5 after:bg-white
                //           after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5'
                //         ></label>
                //     </div>
                //     <p className='m-0 text-[13px] text-[#666]'>Hiển thị các điểm đánh dấu</p>
                // </div>
                <></>
            )}

            {/* Phần chọn chân mày */}
            <div className=''>
                <div className='flex flex-col gap-4'>
                    {/* Chọn mẫu chân mày */}
                    {breakpoints.desktop && (
                        <div className='w-full'>
                            <div className='m-0 mb-2 text-[13px] text-[#666] flex items-center gap-2'>
                                <span>Chân mày đề xuất</span>
                            </div>
                            <EyebrowList
                                availableEyebrows={availableEyebrows}
                                placedBoxes={placedBoxes}
                                handleDoubleClick={onDoubleClick ?? (() => {})}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
