// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 6395771615465059923733288284154138370887237697719419362240242416032620529457;
    uint256 constant deltax2 = 15080822934051028079113079068248566603185116554182526299804905406044233646647;
    uint256 constant deltay1 = 14840221794689981819359302102952737439278791343284931755340781959301640292499;
    uint256 constant deltay2 = 16135577708610908916243646285012768564262114912001230172239497971612952544624;

    
    uint256 constant IC0x = 13958111792333713120197568044906601803024433469759841209867713761561761264946;
    uint256 constant IC0y = 11471554157165912115372763492287889584413214146837662654629853773433679562027;
    
    uint256 constant IC1x = 13674865454050197898843679669762943208761561687911252282360704774397520110704;
    uint256 constant IC1y = 6319461341257879279295870666786887701422643277415769540676308470171929469030;
    
    uint256 constant IC2x = 11909661966926949485421650309916263067603404431549025193985379716266633708131;
    uint256 constant IC2y = 2693206982886796090901667677796501539957544632790055061702672817378121452282;
    
    uint256 constant IC3x = 1942580923317521069196679817132396848436019862010621678067650232176520862857;
    uint256 constant IC3y = 19028200265033250741052881550855522631462483359557110718743184952353324808629;
    
    uint256 constant IC4x = 13137631992786460876835861024844343561214148403533752002496418493898633686747;
    uint256 constant IC4y = 9296205781594764346209403714969344898254787070864520981933575198285337176117;
    
    uint256 constant IC5x = 17077902194572206654934606153125506446107122236788076335610009543078785132576;
    uint256 constant IC5y = 18629451663338430306987763218912065264670003790452277961627153124402463835774;
    
    uint256 constant IC6x = 6361855325205289056405057917598127387577937860641896273244704460930104050295;
    uint256 constant IC6y = 18058421432436695445184967279247716558056789742965594950525810473901745771902;
    
    uint256 constant IC7x = 17576811954647208870971863051074110069086296889352271243887989505808196692423;
    uint256 constant IC7y = 3453428873210641759498169196254623578762916964776794971630497534510166317881;
    
    uint256 constant IC8x = 11408859138054695641106602248979524174285002724009133444102508566098175027502;
    uint256 constant IC8y = 20832281549303425095373335231353533669548138953003617141296478021137894662574;
    
    uint256 constant IC9x = 20661476488363307563556559564806384573634651248512072458228762745025445188854;
    uint256 constant IC9y = 9798499139267889359366550304759147213979719604187196335837256496481781405613;
    
    uint256 constant IC10x = 12706894478641293243865013115713301806597165956210672263502048558504657294069;
    uint256 constant IC10y = 5088790947362415498683127497976818373132097898108624491416278189479658466524;
    
    uint256 constant IC11x = 19994106675381195399449444854202705286972610678988321547324898355009440429821;
    uint256 constant IC11y = 11389014369870796726807958628988459571171638914594182826164896226414344269344;
    
    uint256 constant IC12x = 2918518512968696721408515068611118135613616675747062025079888171698815045445;
    uint256 constant IC12y = 11674200239934216750155781013012153320765244072406294385402211815772680188494;
    
    uint256 constant IC13x = 2272695299221983068324981072473720109880516966587547435599277287909722627275;
    uint256 constant IC13y = 7925452933251786903971770032927549521794816693639957646647848637977948193005;
    
    uint256 constant IC14x = 21864184328299150791655060587875353860954828854557452339655697481227790775493;
    uint256 constant IC14y = 4400920369555680934767038668447412104895723017020180626163969646183081446479;
    
    uint256 constant IC15x = 1578362467630479785126668792517560882286385989265075052855739129412873639003;
    uint256 constant IC15y = 17154303639470609770844503323659242765639691537645990951318967153570232244342;
    
    uint256 constant IC16x = 8968766789916228962682079053520947030527218980438274913132302517963611109025;
    uint256 constant IC16y = 14225952794222958838268318211865229420355536730674543387984742353156249941854;
    
    uint256 constant IC17x = 2050754166952409021532286134670746167439979579620781821451518196977850208557;
    uint256 constant IC17y = 16177710972799671984936505270312497167517779055862234091274203881056524820991;
    
    uint256 constant IC18x = 7014929871337793964757832403941717168583148720846187268357013595758655561264;
    uint256 constant IC18y = 698575019390752095593733733279673092189533624298256883408932093661587117795;
    
    uint256 constant IC19x = 18142857893518232939679683503654363169891104055483759153770442269837739021835;
    uint256 constant IC19y = 14623858016676617803443165455835316049728587901480713836474839990741495087327;
    
    uint256 constant IC20x = 4769374413638042601566200139063493348987489974837395149126170190832533517876;
    uint256 constant IC20y = 18865724990480452822305883318492267857411246532425971339788947450470250116978;
    
    uint256 constant IC21x = 10458628257937885396231707430531261831329786965099648989940481263867226633998;
    uint256 constant IC21y = 11869530138932601257301400282053939914126104476128700484915444948749469902675;
    
    uint256 constant IC22x = 8879304923489406463468765914192974478131661823913956687738206542446793315793;
    uint256 constant IC22y = 7583374643081023813976244746470677532505625024294227849820032122535107086129;
    
    uint256 constant IC23x = 331103800165965858729771026612994071806154934379917456103608268681197862323;
    uint256 constant IC23y = 14004763126886872207541531075603603100367221495431594667731104949256214199356;
    
    uint256 constant IC24x = 14280926981776508064170805786278406663535580189476416916089753599474528542855;
    uint256 constant IC24y = 1608591104300655011144618821841183713854159664105846773645770372283895387200;
    
    uint256 constant IC25x = 19030044327542649316240978680517692486116891982038197709438966441698907855957;
    uint256 constant IC25y = 6242687771953389129333469634825852587276419236714764326405192365958315704497;
    
    uint256 constant IC26x = 8233336422464437204759017754246577468725273507414901878802984772996547179667;
    uint256 constant IC26y = 7913378866033191499391291072470822350696940609296086804748287055978796301462;
    
    uint256 constant IC27x = 13198854066677292346804281060927620362434869990211832196789945454641639286488;
    uint256 constant IC27y = 10884913079778469381465065003167885353613166537908297554771599429262838423271;
    
    uint256 constant IC28x = 7126843374736898853763223336272928236867594733864724074422097184062052974037;
    uint256 constant IC28y = 21246040526732156902735440244805866766147332375844748587190043180851067431521;
    
    uint256 constant IC29x = 10135389361790411046213282323107397766697221977527930760261627246768487527694;
    uint256 constant IC29y = 2418037857213246522357380061456879104025089914435556401912695987168768308469;
    
    uint256 constant IC30x = 21753848514317128453841987081433839215996886390559631467116791604113218892657;
    uint256 constant IC30y = 9143992858005488075980011189763281546141463322214111285601842050836559613046;
    
    uint256 constant IC31x = 13987139297938659389952529892556380067944675562005001480430713526619036450887;
    uint256 constant IC31y = 4893153946431605114513592498753963295342237593904334966381064175377819934861;
    
    uint256 constant IC32x = 18898498062557692207833902666687155027658530169098753717441981914509014744031;
    uint256 constant IC32y = 17180933684345427978493264848382587379171750165714364617101969092762785718044;
    
    uint256 constant IC33x = 12848372480330892104301935233859244817748639792549405505995587008856352889669;
    uint256 constant IC33y = 10833931518671019477253877907736433994796132769533615463963317244154261563508;
    
    uint256 constant IC34x = 21122556086279720824373173347810974780614638792880066251656719011656133134562;
    uint256 constant IC34y = 14939901375887808717256697158467047166659595701002592732017335906478030675700;
    
    uint256 constant IC35x = 17348420717533003359301166409454114445148004231121986385588918394264478866980;
    uint256 constant IC35y = 969648306357106422320530381301984931333735788893139336297051598241010049525;
    
    uint256 constant IC36x = 1998318649527609388230968848003908661652445995635577135324077926257676928321;
    uint256 constant IC36y = 5333247835683450115726913502600907971751035742962126234980041223421090933861;
    
    uint256 constant IC37x = 16802684668611812369097874401057690066572086320485060777296364453864121718431;
    uint256 constant IC37y = 17542544375405091868196604492075880105457427658507121735838541534162860277365;
    
    uint256 constant IC38x = 8886442837175084151811086136862922566614008441175337330253512914941241686612;
    uint256 constant IC38y = 1271176893384379699573910834393057397866467387283837227880574976868508652127;
    
    uint256 constant IC39x = 799452182874896451283754893077666738872609160254435409500570365693989249177;
    uint256 constant IC39y = 3009248345935122549062268362275007696214993574150143141494274803350033935639;
    
    uint256 constant IC40x = 12475427018358870592884295898679869512446890600978619309553392809572672009000;
    uint256 constant IC40y = 18855899558240244858888611921333509765925131911160518327696755942371769328104;
    
    uint256 constant IC41x = 15660263521653620128808333160467747392265881358777747701910636490180712433658;
    uint256 constant IC41y = 3701814493537935443468848330110630926085044916464621114229858075285404763065;
    
    uint256 constant IC42x = 12065532250424880921922696835244123647867229339377285096349056236630505117061;
    uint256 constant IC42y = 12261011108650437842217402261880672939341120425694236606672225148344013053098;
    
    uint256 constant IC43x = 16138983440170120363384702479142185009016948538348675284963520105638850001917;
    uint256 constant IC43y = 9506078199246174080490934766970624852351508537956808470168418143917236474141;
    
    uint256 constant IC44x = 12956451152167666478023366139807369240531817673225988269631391637038002670347;
    uint256 constant IC44y = 2834234443007772622453947439473020265358086583543973519095928240960783848830;
    
    uint256 constant IC45x = 11096630292205224354753708190512674846075512938439590059051265040405880643302;
    uint256 constant IC45y = 10702622599833784144757951632708979503763868719243035323064685767790347609797;
    
    uint256 constant IC46x = 13007321799425413590840221567156258922963397749399588433858987753436880404890;
    uint256 constant IC46y = 21400897023619835494549603996486218716177644644899311968898228126459962238147;
    
    uint256 constant IC47x = 1545592651567439730388087496296080354540013504076019246344620722363861638167;
    uint256 constant IC47y = 13869009803127205161534349585257218351331801998596933930770111747651173805183;
    
    uint256 constant IC48x = 15011073520714676469884942356558398649878472358566495874254976617972036752428;
    uint256 constant IC48y = 19292479439596306719398294811237922381809624361777607916733896817992184098987;
    
    uint256 constant IC49x = 16665912648949969240245499271488534953055863440447120448353868742443266308381;
    uint256 constant IC49y = 21595814833221441604892527445765851719993924880302411804479298441538509066695;
    
    uint256 constant IC50x = 17182072838621621226259233801263540613332430437424141140359257015283859080620;
    uint256 constant IC50y = 16033848369751956900775621637936328557905149227526070622010060737717158311301;
    
    uint256 constant IC51x = 11396053453609755637332769590457962301353669502176913742396536822324204407994;
    uint256 constant IC51y = 16782885490169956149452485095206293644467120154420833272252526280559141850894;
    
    uint256 constant IC52x = 8137660894688411227185651645925077954645868091556361685187979410478110117275;
    uint256 constant IC52y = 18158909595353721842003583574166988087639982986432945065646446988472744047138;
    
    uint256 constant IC53x = 1177468312985912774727003301137783439314620000518096512228604985720740195234;
    uint256 constant IC53y = 18354525250418848383862274820537731393175088705137811996385102130280983059988;
    
    uint256 constant IC54x = 541189343456047451057131570001274570360702906395769904959779814641586260708;
    uint256 constant IC54y = 13549035018369505944029285511023580634589019267048788133823776230392836717392;
    
    uint256 constant IC55x = 10619386922611504374227137735929837773963278809038518620846470051516145120093;
    uint256 constant IC55y = 809242045151700144042118873568872376593518461113392523876102308631382383452;
    
    uint256 constant IC56x = 4900608140228862188198894754197075858587389053241163768352706148018077718837;
    uint256 constant IC56y = 5724237196830604699287810601242593215524549994896188588254615517486018167601;
    
    uint256 constant IC57x = 15643003578820554490887794364197516607721540777559013881664934339087785241415;
    uint256 constant IC57y = 5727026377943182803262412570660961871620006851253368729237787315675634240663;
    
    uint256 constant IC58x = 12666647079469509725890981299059296691218874541481197060695749264234459034926;
    uint256 constant IC58y = 11813505686763167169454943154071976758861659258708384944254422909748970462748;
    
    uint256 constant IC59x = 3348007043203048097510908368294699979880247969512043076179146818668110586619;
    uint256 constant IC59y = 1660510573924065092100926499013749992749681436640281454285699547262501980461;
    
    uint256 constant IC60x = 12055018721080629825773608312441302732955736011653608337864135824970523775416;
    uint256 constant IC60y = 9585593428676209771943156197559333174780431253254288288914361265561956430312;
    
    uint256 constant IC61x = 17639022882588297366634927232749694062173874232021712182434517305185629470524;
    uint256 constant IC61y = 70797738154493539586865993912761752594386689246296273835858342322742949535;
    
    uint256 constant IC62x = 16029450701044722972361753619444306856313196288017061947758051148998733583799;
    uint256 constant IC62y = 3100360506631994087050059790149330668369634705045407712163843502380199032105;
    
    uint256 constant IC63x = 6710715683281415168119014166510568580320356559156816980279756491339196498350;
    uint256 constant IC63y = 13622850171994629838485971441287986527205415262576724822106398898905925114391;
    
    uint256 constant IC64x = 9400470296850736723639511662443030665742102426195202909886946836868453365183;
    uint256 constant IC64y = 5440322263982942677879999805567615193883059184268473059224268201846045891682;
    
    uint256 constant IC65x = 5439412397873072786480848221494066868819518329446783024256633672545207481901;
    uint256 constant IC65y = 20516784433859452874911067782379536074276856935436222373357808206652756866849;
    
    uint256 constant IC66x = 20563290202406314737507169810967582825906847856986149925795553356813430688282;
    uint256 constant IC66y = 5477550268920636778690733064730135377913421366348769794239414071496558336823;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[66] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                
                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))
                
                g1_mulAccC(_pVk, IC18x, IC18y, calldataload(add(pubSignals, 544)))
                
                g1_mulAccC(_pVk, IC19x, IC19y, calldataload(add(pubSignals, 576)))
                
                g1_mulAccC(_pVk, IC20x, IC20y, calldataload(add(pubSignals, 608)))
                
                g1_mulAccC(_pVk, IC21x, IC21y, calldataload(add(pubSignals, 640)))
                
                g1_mulAccC(_pVk, IC22x, IC22y, calldataload(add(pubSignals, 672)))
                
                g1_mulAccC(_pVk, IC23x, IC23y, calldataload(add(pubSignals, 704)))
                
                g1_mulAccC(_pVk, IC24x, IC24y, calldataload(add(pubSignals, 736)))
                
                g1_mulAccC(_pVk, IC25x, IC25y, calldataload(add(pubSignals, 768)))
                
                g1_mulAccC(_pVk, IC26x, IC26y, calldataload(add(pubSignals, 800)))
                
                g1_mulAccC(_pVk, IC27x, IC27y, calldataload(add(pubSignals, 832)))
                
                g1_mulAccC(_pVk, IC28x, IC28y, calldataload(add(pubSignals, 864)))
                
                g1_mulAccC(_pVk, IC29x, IC29y, calldataload(add(pubSignals, 896)))
                
                g1_mulAccC(_pVk, IC30x, IC30y, calldataload(add(pubSignals, 928)))
                
                g1_mulAccC(_pVk, IC31x, IC31y, calldataload(add(pubSignals, 960)))
                
                g1_mulAccC(_pVk, IC32x, IC32y, calldataload(add(pubSignals, 992)))
                
                g1_mulAccC(_pVk, IC33x, IC33y, calldataload(add(pubSignals, 1024)))
                
                g1_mulAccC(_pVk, IC34x, IC34y, calldataload(add(pubSignals, 1056)))
                
                g1_mulAccC(_pVk, IC35x, IC35y, calldataload(add(pubSignals, 1088)))
                
                g1_mulAccC(_pVk, IC36x, IC36y, calldataload(add(pubSignals, 1120)))
                
                g1_mulAccC(_pVk, IC37x, IC37y, calldataload(add(pubSignals, 1152)))
                
                g1_mulAccC(_pVk, IC38x, IC38y, calldataload(add(pubSignals, 1184)))
                
                g1_mulAccC(_pVk, IC39x, IC39y, calldataload(add(pubSignals, 1216)))
                
                g1_mulAccC(_pVk, IC40x, IC40y, calldataload(add(pubSignals, 1248)))
                
                g1_mulAccC(_pVk, IC41x, IC41y, calldataload(add(pubSignals, 1280)))
                
                g1_mulAccC(_pVk, IC42x, IC42y, calldataload(add(pubSignals, 1312)))
                
                g1_mulAccC(_pVk, IC43x, IC43y, calldataload(add(pubSignals, 1344)))
                
                g1_mulAccC(_pVk, IC44x, IC44y, calldataload(add(pubSignals, 1376)))
                
                g1_mulAccC(_pVk, IC45x, IC45y, calldataload(add(pubSignals, 1408)))
                
                g1_mulAccC(_pVk, IC46x, IC46y, calldataload(add(pubSignals, 1440)))
                
                g1_mulAccC(_pVk, IC47x, IC47y, calldataload(add(pubSignals, 1472)))
                
                g1_mulAccC(_pVk, IC48x, IC48y, calldataload(add(pubSignals, 1504)))
                
                g1_mulAccC(_pVk, IC49x, IC49y, calldataload(add(pubSignals, 1536)))
                
                g1_mulAccC(_pVk, IC50x, IC50y, calldataload(add(pubSignals, 1568)))
                
                g1_mulAccC(_pVk, IC51x, IC51y, calldataload(add(pubSignals, 1600)))
                
                g1_mulAccC(_pVk, IC52x, IC52y, calldataload(add(pubSignals, 1632)))
                
                g1_mulAccC(_pVk, IC53x, IC53y, calldataload(add(pubSignals, 1664)))
                
                g1_mulAccC(_pVk, IC54x, IC54y, calldataload(add(pubSignals, 1696)))
                
                g1_mulAccC(_pVk, IC55x, IC55y, calldataload(add(pubSignals, 1728)))
                
                g1_mulAccC(_pVk, IC56x, IC56y, calldataload(add(pubSignals, 1760)))
                
                g1_mulAccC(_pVk, IC57x, IC57y, calldataload(add(pubSignals, 1792)))
                
                g1_mulAccC(_pVk, IC58x, IC58y, calldataload(add(pubSignals, 1824)))
                
                g1_mulAccC(_pVk, IC59x, IC59y, calldataload(add(pubSignals, 1856)))
                
                g1_mulAccC(_pVk, IC60x, IC60y, calldataload(add(pubSignals, 1888)))
                
                g1_mulAccC(_pVk, IC61x, IC61y, calldataload(add(pubSignals, 1920)))
                
                g1_mulAccC(_pVk, IC62x, IC62y, calldataload(add(pubSignals, 1952)))
                
                g1_mulAccC(_pVk, IC63x, IC63y, calldataload(add(pubSignals, 1984)))
                
                g1_mulAccC(_pVk, IC64x, IC64y, calldataload(add(pubSignals, 2016)))
                
                g1_mulAccC(_pVk, IC65x, IC65y, calldataload(add(pubSignals, 2048)))
                
                g1_mulAccC(_pVk, IC66x, IC66y, calldataload(add(pubSignals, 2080)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            
            checkField(calldataload(add(_pubSignals, 480)))
            
            checkField(calldataload(add(_pubSignals, 512)))
            
            checkField(calldataload(add(_pubSignals, 544)))
            
            checkField(calldataload(add(_pubSignals, 576)))
            
            checkField(calldataload(add(_pubSignals, 608)))
            
            checkField(calldataload(add(_pubSignals, 640)))
            
            checkField(calldataload(add(_pubSignals, 672)))
            
            checkField(calldataload(add(_pubSignals, 704)))
            
            checkField(calldataload(add(_pubSignals, 736)))
            
            checkField(calldataload(add(_pubSignals, 768)))
            
            checkField(calldataload(add(_pubSignals, 800)))
            
            checkField(calldataload(add(_pubSignals, 832)))
            
            checkField(calldataload(add(_pubSignals, 864)))
            
            checkField(calldataload(add(_pubSignals, 896)))
            
            checkField(calldataload(add(_pubSignals, 928)))
            
            checkField(calldataload(add(_pubSignals, 960)))
            
            checkField(calldataload(add(_pubSignals, 992)))
            
            checkField(calldataload(add(_pubSignals, 1024)))
            
            checkField(calldataload(add(_pubSignals, 1056)))
            
            checkField(calldataload(add(_pubSignals, 1088)))
            
            checkField(calldataload(add(_pubSignals, 1120)))
            
            checkField(calldataload(add(_pubSignals, 1152)))
            
            checkField(calldataload(add(_pubSignals, 1184)))
            
            checkField(calldataload(add(_pubSignals, 1216)))
            
            checkField(calldataload(add(_pubSignals, 1248)))
            
            checkField(calldataload(add(_pubSignals, 1280)))
            
            checkField(calldataload(add(_pubSignals, 1312)))
            
            checkField(calldataload(add(_pubSignals, 1344)))
            
            checkField(calldataload(add(_pubSignals, 1376)))
            
            checkField(calldataload(add(_pubSignals, 1408)))
            
            checkField(calldataload(add(_pubSignals, 1440)))
            
            checkField(calldataload(add(_pubSignals, 1472)))
            
            checkField(calldataload(add(_pubSignals, 1504)))
            
            checkField(calldataload(add(_pubSignals, 1536)))
            
            checkField(calldataload(add(_pubSignals, 1568)))
            
            checkField(calldataload(add(_pubSignals, 1600)))
            
            checkField(calldataload(add(_pubSignals, 1632)))
            
            checkField(calldataload(add(_pubSignals, 1664)))
            
            checkField(calldataload(add(_pubSignals, 1696)))
            
            checkField(calldataload(add(_pubSignals, 1728)))
            
            checkField(calldataload(add(_pubSignals, 1760)))
            
            checkField(calldataload(add(_pubSignals, 1792)))
            
            checkField(calldataload(add(_pubSignals, 1824)))
            
            checkField(calldataload(add(_pubSignals, 1856)))
            
            checkField(calldataload(add(_pubSignals, 1888)))
            
            checkField(calldataload(add(_pubSignals, 1920)))
            
            checkField(calldataload(add(_pubSignals, 1952)))
            
            checkField(calldataload(add(_pubSignals, 1984)))
            
            checkField(calldataload(add(_pubSignals, 2016)))
            
            checkField(calldataload(add(_pubSignals, 2048)))
            
            checkField(calldataload(add(_pubSignals, 2080)))
            
            checkField(calldataload(add(_pubSignals, 2112)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
