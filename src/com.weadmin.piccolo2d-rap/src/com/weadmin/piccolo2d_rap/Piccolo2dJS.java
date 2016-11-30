package com.weadmin.piccolo2d_rap;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import org.eclipse.rap.json.JsonObject;
import org.eclipse.swt.widgets.Composite;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;


public class Piccolo2dJS extends SVWidgetBase{

	private static final long serialVersionUID = -7580109674486263430L;

	public Piccolo2dJS(Composite parent, int style) {
		super(parent, style);
	}

	public void setLineColor(JSONObject json){
		super.setRemoteProp("lineColor", JsonObject.readFrom(json.toJSONString()));
	}

	public static String setDate(Date date){
		JSONObject parameters = new JSONObject();
		parameters.put("date", new SimpleDateFormat("yyyy-MM-dd").format(date));
		parameters.put("currentDay", formatDate(new Date()));
		return parameters.toJSONString();
	}

	public void showList(Date date,List<JSONObject> list){
		super.setRemoteProp("date", JsonObject.readFrom(setDate(date)));
		listSort(list);
		super.callRemoteMethod("showList", JsonObject.readFrom(dealWithList(date,list)));
	}
	
	@SuppressWarnings({ "deprecation", "rawtypes" })
	public static String dealWithList(Date date, List<JSONObject> list){
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		int month = calendar.get(Calendar.MONTH)+1;   //the month of search data
		JSONObject json_line,json_lines = null;
		JSONArray array_line,arrary_data,array_axis = null;
		JSONObject data = new JSONObject();
		JSONObject prev = new JSONObject();
		JSONObject current = new JSONObject();
		JSONObject next = new JSONObject();
		Date dd = null;
		boolean flag = false;
		int x,dataMonth = 0;
		Double y;
		String jsonKey,day = null;
		for(JSONObject json:list){
			dd = json.getDate("savetime");
			dataMonth = dd.getMonth()+1;    //the month of searching data
			for(Iterator it = json.keySet().iterator();it.hasNext();){
				jsonKey = (String) it.next();
				if (!jsonKey.equals("savetime")) {
					flag = false;
					x = dd.getHours()*60+dd.getMinutes();   //x-axis
					y = json.getDouble(jsonKey);           //y-axis
					array_axis = new JSONArray();
					array_axis.add(x);
					array_axis.add(y);
					day = String.valueOf(dd.getDate());
					if (dataMonth < month) {              //previous month
						if (prev.containsKey(day)) {
							array_line = prev.getJSONArray(day);
							for(int i=0;i<array_line.size();i++){
								json_line = (JSONObject) array_line.get(i);
								if (json_line.getString("name").equals(jsonKey)) {
									arrary_data = json_line.getJSONArray("data");
									arrary_data.add(array_axis);
									flag = true;
									break;
								}
							}
							if (!flag) {
								json_lines = new JSONObject();
								json_lines.put("name", jsonKey);
								arrary_data = new JSONArray();
								arrary_data.add(array_axis);
								json_lines.put("data", arrary_data);
								array_line.add(json_lines);
							}
						}else{
							json_line = new JSONObject();			//line
							json_line.put("name", jsonKey);
							arrary_data = new JSONArray();
							arrary_data.add(array_axis);
							json_line.put("data", arrary_data);
							array_line = new JSONArray();
							array_line.add(json_line);
							prev.put(day, array_line);
						}
					}
					if (dataMonth == month) {                     //current month
						if (current.containsKey(day)) {
							json_lines = null;
							array_line = current.getJSONArray(day);
							for(int i=0;i<array_line.size();i++){
								json_line = (JSONObject) array_line.get(i);
								if (json_line.getString("name").equals(jsonKey)) {
									arrary_data = json_line.getJSONArray("data");
									arrary_data.add(array_axis);
									flag = true;
									break;
								}
							}
							if (!flag) {
								json_lines = new JSONObject();
								json_lines.put("name", jsonKey);
								arrary_data = new JSONArray();
								arrary_data.add(array_axis);
								json_lines.put("data", arrary_data);
								array_line.add(json_lines);
							}
						}else{
							json_line = new JSONObject();			//line
							json_line.put("name", jsonKey);
							arrary_data = new JSONArray();
							arrary_data.add(array_axis);
							json_line.put("data", arrary_data);
							array_line = new JSONArray();
							array_line.add(json_line);
							current.put(day, array_line);
						}
					}
					if (dataMonth > month) {                       //next month
						if (next.containsKey(day)) {
							json_lines = null;
							array_line = next.getJSONArray(day);
							for(int i=0;i<array_line.size();i++){
								json_line = (JSONObject) array_line.get(i);
								if (json_line.getString("name").equals(jsonKey)) {
									arrary_data = json_line.getJSONArray("data");
									arrary_data.add(array_axis);
									flag = true;
									break;
								}
							}
							if (!flag) {
								json_lines = new JSONObject();
								json_lines.put("name", jsonKey);
								arrary_data = new JSONArray();
								arrary_data.add(array_axis);
								json_lines.put("data", arrary_data);
								array_line.add(json_lines);
							}
						}else{
							json_line = new JSONObject();			//line
							json_line.put("name", jsonKey);
							arrary_data = new JSONArray();
							arrary_data.add(array_axis);
							json_line.put("data", arrary_data);
							array_line = new JSONArray();
							array_line.add(json_line);
							next.put(day, array_line);
						}
					}
				}
			}
		}
		data.put("prev", prev);
		data.put("current", current);
		data.put("next", next);
		return data.toJSONString();
	}

	public static void listSort(List<JSONObject> list){
		Collections.sort(list,new Comparator<JSONObject>() {//order by savetime
			public int compare(JSONObject json1,JSONObject json2){
				if (json1!=null&&json2!=null) {
					return json1.getString("savetime").compareTo(json2.getString("savetime"));
				}
				return 0;
			}
		});
	}

	public static Date stringToDate(String s){
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date date = null;
		try {
			date = sdf.parse(s);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return date;
	}
	
	public static String formatDate(Date date){
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		return sdf.format(date);
	}

	@Override
	protected void handleSetProp(JsonObject properties) {
		//  System.out.println("handleSetProp from the js trigger!!");
	}

	@Override
	protected void handleCallMethod(String method, JsonObject parameters) {
		// System.out.println("handleCallMethod :"+method);
	}

	@Override
	protected void handleCallNotify(String event, JsonObject parameters) {

	}

	@Override
	protected String getWidgetName() {
		return "piccolo2djs";
	}

	@Override
	protected ArrayList<CustomRes> getCustomRes() {
		ArrayList<CustomRes> res = new ArrayList<>();
		res.add(new CustomRes("esl.js", true, false));
		res.add(new CustomRes("zrender.js", true, false));
		res.add(new CustomRes("jquery.js", true, false));
		res.add(new CustomRes("echarts.min.js", true, false));
		res.add(new CustomRes("piccolo2d.js", true, false));
		res.add(new CustomRes("detailCharts.js", true, false));
		res.add(new CustomRes("fishEyeCalendar.js", true, false));
		res.add(new CustomRes("handler.js", true, false));
		return res;
	}

}
