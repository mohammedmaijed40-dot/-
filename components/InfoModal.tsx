import React from 'react';
import { Asset } from '../types';
import { ASSET_DETAILS } from '../constants';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetDetails: typeof ASSET_DETAILS[Asset];
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, assetDetails }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl text-gray-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className={`text-2xl font-bold ${assetDetails.accentClass}`}>فهم أداة تحليل تدفق السيولة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                     <section>
                        <h3 className="text-xl font-semibold mb-2 text-slate-300">ما هي هذه الأداة؟</h3>
                        <div className="bg-slate-900 p-4 rounded-lg border border-cyan-500">
                             <p className="text-gray-300">
                                هذه الأداة تتصل مباشرة بالبيانات الحية للأسواق العالمية ({assetDetails.name} والبيتكوين) وتقوم بتحليلها في الوقت الفعلي.
                                <br/><br/>
                                الهدف هو رصد الإشارات المحتملة بناءً على حركة السعر، مع محاكاة ذكية لحجم التداول والتغير في العقود المفتوحة (ΔOI) لتعطيك فكرة عن سلوك السوق وقوة الحركة الحالية.
                            </p>
                        </div>
                    </section>
                     <section>
                        <h3 className="text-xl font-semibold mb-2 text-slate-300">لوحة إشارات الدخول المبسطة</h3>
                        <p className="text-gray-400">
                           تقوم هذه اللوحة بتحليل جميع الإشارات المعقدة وتلخصها لك في توصيات واضحة: "شراء" أو "بيع".
                        </p>
                           <ul className="list-none space-y-3 text-gray-300 mt-3">
                               <li className="p-3 bg-green-900/50 rounded-md">
                                   <strong className="font-semibold text-green-300">متى تظهر إشارة الشراء؟</strong>
                                   <p className="text-sm text-gray-400 mt-1">تظهر إشارة الشراء عند وجود زخم قوي (مشترون جدد يدخلون) أو عند احتمال انعكاس صعودي (البائعون يغلقون مراكزهم).</p>
                               </li>
                               <li className="p-3 bg-red-900/50 rounded-md">
                                   <strong className="font-semibold text-red-300">متى تظهر إشارة البيع؟</strong>
                                    <p className="text-sm text-gray-400 mt-1">تظهر إشارة البيع عند وجود زخم بيعي قوي (بائعون جدد يدخلون) أو عند احتمال انعكاس هبوطي (المشترون يجنون أرباحهم).</p>
                               </li>
                           </ul>
                    </section>
                    
                    <section>
                        <h3 className={`text-xl font-semibold mb-2 ${assetDetails.accentClass}`}>تفاصيل الإشارات (في السجل الكامل)</h3>
                         <p className="text-gray-400">
                                يرصد "سجل الإشارات الكامل" 4 أنواع من الحالات المتقدمة بناءً على العلاقة بين السعر، حجم التداول، و (ΔOI).
                            </p>
                           <ul className="list-none space-y-4 text-gray-300 mt-4">
                               <li className="p-3 bg-green-900/50 rounded-md border-l-4 border-green-400">
                                   <strong className="font-semibold text-green-300">استمرار صعودي (Bullish Continuation)</strong>
                                   <p className="text-sm text-gray-400">شمعة صاعدة + حجم تداول عالي + ΔOI إيجابي وعالي.</p>
                                   <p className="text-sm text-gray-400 mt-1"><em>التفسير:</em> مشترون جدد يدخلون السوق بقوة لدعم الاتجاه الصاعد.</p>
                               </li>
                               <li className="p-3 bg-red-900/50 rounded-md border-l-4 border-red-400">
                                   <strong className="font-semibold text-red-300">استمرار هبوطي (Bearish Continuation)</strong>
                                   <p className="text-sm text-gray-400">شمعة هابطة + حجم تداول عالي + ΔOI إيجابي وعالي.</p>
                                   <p className="text-sm text-gray-400 mt-1"><em>التفسير:</em> بائعون جدد يدخلون السوق بقوة لدعم الاتجاه الهابط.</p>
                               </li>
                               <li className="p-3 bg-lime-900/50 rounded-md border-l-4 border-lime-400">
                                   <strong className="font-semibold text-lime-300">تشبع شرائي (Bullish Exhaustion)</strong>
                                   <p className="text-sm text-gray-400">شمعة صاعدة + حجم تداول عالي + ΔOI سلبي.</p>
                                   <p className="text-sm text-gray-400 mt-1"><em>التفسير:</em> السعر يرتفع لكن العقود تُغلق. قد يكون هذا جني أرباح من المشترين القدامى، وهي إشارة ضعف قد تسبق انعكاسًا هبوطيًا.</p>
                               </li>
                               <li className="p-3 bg-rose-900/50 rounded-md border-l-4 border-rose-400">
                                   <strong className="font-semibold text-rose-300">تشبع بيعي (Bearish Exhaustion)</strong>
                                   <p className="text-sm text-gray-400">شمعة هابطة + حجم تداول عالي + ΔOI سلبي.</p>
                                   <p className="text-sm text-gray-400 mt-1"><em>التفسير:</em> السعر يهبط لكن العقود تُغلق. قد يكون هذا إغلاق لمراكز البيع، وهي إشارة ضعف قد تسبق انعكاسًا صعوديًا.</p>
                               </li>
                           </ul>
                    </section>
                </div>
                <div className="p-4 bg-slate-900 text-right">
                     <button 
                        onClick={onClose} 
                        className={`px-4 py-2 text-slate-900 rounded-md font-semibold ${assetDetails.accentBgClass} hover:brightness-110`}
                    >
                        فهمت، إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;